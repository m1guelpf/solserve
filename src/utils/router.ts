import Wallet from './wallet'
import { FastifyRequest } from 'fastify'
import { executeFunction } from './executor'
import { DeployedContractData } from './deployer'

const buildPath = (contractPath: string): string => {
	return contractPath
		.replace(/\.sol$/, '')
		.replace(/\/index$/, '/')
		.replace(/\[(\w*?)]/gm, `:$1`)
}

export const buildRoutes = (
	wallet: Wallet,
	contracts: {
		[key: string]: DeployedContractData
	}
): { [key: string]: CallableFunction } => {
	return Object.fromEntries(
		Object.entries(contracts).map(([path, contractData]) => {
			return [
				buildPath(path),
				(req: FastifyRequest) => {
					return executeFunction(wallet, contractData, 'handle', req.params as Record<string, unknown>)
				},
			]
		})
	)
}
