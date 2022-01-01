import Wallet from './wallet'
import { Address } from 'ethereumjs-util'
import { Transaction } from '@ethereumjs/tx'
import { RunTxResult } from '@ethereumjs/vm/dist/runTx'
import { CompilerOutputContract, CompilerOutputContracts } from 'solc'

export type DeployedContractData = CompilerOutputContract & { address: Address }

export const deployContract = async (wallet: Wallet, compiledContract: CompilerOutputContract): Promise<Address> => {
	const deploymentResult: RunTxResult = await wallet.submitTx(
		Transaction.fromTxData({
			value: 0,
			gasLimit: 2000000, // We assume that 2M is enough,
			gasPrice: 1,
			data: `0x${compiledContract.evm!.bytecode.object!}`,
			nonce: await wallet.getNonce(),
		})
	)

	return deploymentResult.createdAddress!
}

const getRouteContracts = (compiledContracts: CompilerOutputContracts): { [key: string]: CompilerOutputContract } =>
	Object.fromEntries(
		Object.entries(compiledContracts).map(
			([path, contractData]: [string, { [contractName: string]: CompilerOutputContract }]) => [
				path,
				Object.values(contractData)[0],
			]
		)
	)

export const deployContracts = async (
	wallet: Wallet,
	compiledContracts: CompilerOutputContracts
): Promise<{ [key: string]: DeployedContractData }> => {
	return Object.fromEntries(
		await Promise.all(
			Object.entries(getRouteContracts(compiledContracts)).map(
				async ([path, routeContract]: [string, CompilerOutputContract]): Promise<
					[string, DeployedContractData]
				> => [path, { ...routeContract, address: await deployContract(wallet, routeContract) }]
			)
		)
	)
}
