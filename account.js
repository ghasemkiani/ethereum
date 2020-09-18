const Web3 = require("web3");
const BigNumber = require("bignumber.js");

const {cutil} = require("@ghasemkiani/commonbase/cutil");
const {Base} = require("@ghasemkiani/commonbase/base");
const {util: ethutil} = require("@ghasemkiani/ethereum/util");

class Account extends Base {
	get util() {
		if(!this._util) {
			this._util = ethutil;
		}
		return this._util;
	}
	set util(util) {
		this._util = util;
	}
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
		return this.balances[this.tok];
	}
	set balance(balance) {
		this.balances[this.tok] = balance;
	}
	async toGetBalance() {
		let web3 = this.util.web3;
		let walletAddress = this.address;
		let balance = await this.util.toGetBalance(walletAddress);
		this.balance = balance;
		return balance;
	}
	async toGetTokenBalance(token) {
		if(token === this.tok) {
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
		if(token === this.tok) {
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
}
cutil.extend(Account.prototype, {
	tok: "ETH",
	_util: null,
	_address: null,
	key: null,
	_balances: null,
});

module.exports = {Account};
