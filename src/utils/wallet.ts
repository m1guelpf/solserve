import VM from '@ethereumjs/vm'
import { Transaction } from '@ethereumjs/tx'
import { parseEther } from '@ethersproject/units'
import { Account, Address, BN } from 'ethereumjs-util'
import { RunTxResult } from '@ethereumjs/vm/dist/runTx'
import { EVMResult } from '@ethereumjs/vm/dist/evm/evm'

class Wallet {
	privateKey: Buffer
	address: Address
	vm: VM | undefined

	constructor(privKey: string) {
		this.privateKey = Buffer.from(privKey, 'hex')
		this.address = Address.fromPrivateKey(this.privateKey)
	}

	connect(vm: VM) {
		this.vm = vm

		return this
	}

	async seedWithEth(amount: number) {
		const account = Account.fromAccountData({
			nonce: 0,
			balance: parseEther(amount.toString()).toHexString(),
		})

		await this.vm!.stateManager.putAccount(this.address, account)
	}

	getAccount(): Promise<Account> {
		return this.vm!.stateManager.getAccount(this.address)
	}

	getNonce(): Promise<BN> {
		return this.getAccount().then((account: Account) => account.nonce)
	}

	signTx(tx: Transaction): Transaction {
		return tx.sign(this.privateKey)
	}

	submitTx(tx: Transaction): Promise<RunTxResult> {
		if (!tx.isSigned()) tx = this.signTx(tx)

		return this.vm!.runTx({ tx }).then((result: RunTxResult) => {
			if (result.execResult.exceptionError) throw result.execResult.exceptionError

			return result
		})
	}

	execute(contractAddress: Address, callData: Buffer | string): Promise<EVMResult> {
		if (typeof callData === 'string') callData = Buffer.from(callData.slice(2), 'hex')

		return this.vm!.runCall({
			to: contractAddress,
			caller: this.address,
			origin: this.address,
			data: callData,
		}).then((result: EVMResult) => {
			if (result.execResult.exceptionError) throw result.execResult.exceptionError

			return result
		})
	}
}

export default Wallet
