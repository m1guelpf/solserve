import VM from '@ethereumjs/vm'
import Wallet from './utils/wallet'
import Server from './utils/server'
import { buildRoutes } from './utils/router'
import { compileContracts } from './utils/compiler'
import { deployContracts, DeployedContractData } from './utils/deployer'

async function main() {
	const vm = new VM({})

	const wallet = new Wallet('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109')
	await wallet.connect(vm).seedWithEth(1)

	console.log('Deploying contracts...')
	const deployedContracts: { [key: string]: DeployedContractData } = await deployContracts(
		wallet,
		await compileContracts()
	)
	console.log('Deployed contracts.')

	const server = new Server()
	server.registerRoutes(buildRoutes(wallet, deployedContracts))

	try {
		console.log('Starting server on localhost:8000')
		await server.start(8000)
	} catch (err) {
		process.exit(1)
	}
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
