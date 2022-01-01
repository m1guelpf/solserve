import Wallet from './wallet'
import { DeployedContractData } from './deployer'
import { BigNumber } from '@ethersproject/bignumber'
import { EVMResult } from '@ethereumjs/vm/dist/evm/evm'
import { AbiEvent, AbiFunction, AbiParameter } from 'solc'
import { AbiCoder, Interface, Result } from '@ethersproject/abi'

const getResponseSignature = (contract: DeployedContractData, fnSig: string): string[] => {
	const functionAbi = contract.abi!.find(({ name }: AbiFunction | AbiEvent) => name === fnSig) as AbiFunction

	return functionAbi.outputs.map((param: AbiParameter) => param.type)
}

const decodeResponse = (response: EVMResult, contract: DeployedContractData, fnSig: string): any => {
	const responseTypes = getResponseSignature(contract, fnSig)
	if (responseTypes.length > 1) throw new Error('Only 1 return argument is supported for now.')

	return normaliseTypes(responseTypes[0], new AbiCoder().decode(responseTypes, response.execResult.returnValue)[0])
}

const normaliseTypes = (type: string, response: Result): any => {
	if (response instanceof BigNumber) return response.toNumber()

	return response
}

export const executeFunction = async (
	wallet: Wallet,
	contract: DeployedContractData,
	fnSig: string,
	params: Record<string, unknown> = {}
) => {
	const sigHash = new Interface(contract.abi!).getSighash('handle')
	const args = new AbiCoder().encode(
		contract.abi!.find(({ name }) => name === 'handle')!.inputs.map(param => param.type),
		Object.values(params)
	)

	return decodeResponse(await wallet.execute(contract.address, `${sigHash}${args.slice(2)}`), contract, fnSig)
}
