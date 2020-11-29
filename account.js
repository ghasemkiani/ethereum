//	@ghasemkiani/ethereum/account

const Web3 = require("web3");
const BigNumber = require("bignumber.js");

const {cutil} = require("@ghasemkiani/commonbase/cutil");
const {Base} = require("@ghasemkiani/commonbase/base");
const {iwutil} = require("@ghasemkiani/ethereum/iwutil");
const {util: utilEth} = require("@ghasemkiani/ethereum/util");
const {Client} = require("@ghasemkiani/etherscan-api/client");
const {iwscan} = require("@ghasemkiani/ethereum/iwscan");

class Account extends cutil.mixin(Base, iwutil, iwscan) {
	get address() {
		if(!this._address && this.key) {
			let web3 = this.util.web3;
			let privateKey = this.key;
			this._address = web3.eth.accounts.privateKeyToAccount(privateKey).address;
		}
		return this._address;
	}
	set address(address) {
		this._address = address;
	}
	get balances() {
		if(!this._balances) {
			this._balances = {};
		}
		return this._balances;
	}
	set balances(balances) {
		this._balances = balances;
	}
	get balance() {
		return this.balances[this.util.tok];
	}
	set balance(balance) {
		this.balances[this.util.tok] = balance;
	}
	async toGetBalance() {
		let web3 = this.util.web3;
		let walletAddress = this.address;
		let balance = await this.util.toGetBalance(walletAddress);
		this.balance = balance;
		return balance;
	}
	async toGetTokenBalance(token) {
		if(token === this.util.tok) {
			return await this.toGetBalance();
		} else {
			let web3 = this.util.web3;
			let walletAddress = this.address;
			let tokenAddress = this.util.contracts[token];
			if(!tokenAddress) {
				throw new Error(`Token '${token}' not found (contract address not defined)`);
			}
			let balance = await this.util.toGetTokenBalanace(walletAddress, tokenAddress);
			this.balances[token] = balance;
			return balance;
		}
	}
	async toTransfer({amount, toAddress}) {
		let web3 = this.util.web3;
		let privateKey = this.key;
		return await this.util.toTransfer({amount, toAddress, privateKey});
	}
	async toTransferToken({amount, token, toAddress}) {
		if(token === this.util.tok) {
			return await this.toTransfer({amount, toAddress});
		} else {
			let web3 = this.util.web3;
			let privateKey = this.key;
			let tokenAddress = this.util.contracts[token];
			if(!tokenAddress) {
				throw new Error(`Token '${token}' not found (contract address not defined)`);
			}
			return await this.util.toTransferToken({amount, tokenAddress, toAddress, privateKey});
		}
	}
	async toSignTransaction(options) {
		let privateKey = this.key;
		let signed = await this.util.web3.eth.accounts.signTransaction(options, privateKey);
		return signed;
	}
	async toSendSignedTransaction(rawTransaction) {
		let receipt = await this.util.web3.eth.sendSignedTransaction(rawTransaction);
		return receipt;
	}
	async toSend(options) {
		let signed = await this.toSignTransaction(options);
		let receipt = await this.toSendSignedTransaction(signed.rawTransaction);
		return receipt;
	}
}
cutil.extend(Account.prototype, {
	defutil: utilEth,
	defScan: Client,
	_address: null,
	key: null,
	_balances: null,
});

module.exports = {Account};
