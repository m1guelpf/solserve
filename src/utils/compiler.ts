import path from 'path'
import fs from 'fs/promises'
const solc = require('solc')
import { CompilerInput, CompilerInputSourceCode, CompilerOutput, CompilerOutputContracts } from 'solc'

const readDirRecursive = async (dir: string): Promise<string[]> => {
	const dirents = await fs.readdir(dir, { withFileTypes: true })

	return Promise.all(
		dirents.map(async (dirent): Promise<string[]> => {
			const res = path.resolve(dir, dirent.name)

			if (!dirent.isDirectory()) return [res]
			return readDirRecursive(res)
		})
	).then(dirList => dirList.flat())
}

const getSolcSources = (): Promise<{ [key: string]: CompilerInputSourceCode }> => {
	const rootPath = path.resolve('./contracts/')

	return readDirRecursive(rootPath).then(async (dirList: string[]) =>
		Object.fromEntries(
			await Promise.all(
				dirList.map(
					async (path: string): Promise<[string, CompilerInputSourceCode]> => [
						path.replace(rootPath, ''),
						{ content: await fs.readFile(path, 'utf-8') },
					]
				)
			)
		)
	)
}

const getSolcInput = async (): Promise<CompilerInput> => ({
	language: 'Solidity',
	sources: await getSolcSources(),
	settings: {
		optimizer: {
			enabled: true,
			runs: 200,
		},
		evmVersion: 'petersburg',
		outputSelection: {
			'*': {
				Route: ['abi', 'evm.bytecode'],
			},
		},
	},
})

export const compileContracts = async (): Promise<CompilerOutputContracts> => {
	const output = JSON.parse(solc.compile(JSON.stringify(await getSolcInput()))) as CompilerOutput

	if (!output.errors) return output.contracts

	let compilationFailed = false
	for (const error of output.errors) {
		if (error.severity !== 'error') console.warn(error.formattedMessage)
		else {
			console.error(error.formattedMessage)
			compilationFailed = true
		}
	}

	if (compilationFailed) throw new Error('Compilation failed')

	return output.contracts
}
