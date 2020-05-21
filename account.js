const Web3 = require("web3");
const BigNumber = require("bignumber.js");

const {cutil} = require("@ghasemkiani/commonbase/cutil");
const {Base} = require("@ghasemkiani/commonbase/base");
const {util: ethutil} = require("@ghasemkiani/ethereum/util");

class Account extends Base {
	get address() {
		if(!this._address && this.key) {
			let web3 = ethutil.web3;
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
		return this.balances["ETH"];
	}
	set balance(balance) {
		this.balances["ETH"] = balance;
	}
	async toGetBalance() {
		let web3 = ethutil.web3;
		let walletAddress = this.address;
		let balance = await ethutil.toGetBalance(walletAddress);
		this.balance = balance;
		return balance;
	}
	async toGetTokenBalance(token) {
		if(token === "ETH") {
			return await this.toGetBalance();
		} else {
			let web3 = ethutil.web3;
			let walletAddress = this.address;
			let tokenAddress = ethutil.contracts[token];
			if(!tokenAddress) {
				throw new Error(`Token '${token}' not found (contract address not defined)`);
			}
			let balance = await ethutil.toGetTokenBalanace(walletAddress, tokenAddress);
			this.balances[token] = balance;
			return balance;
		}
	}
}
cutil.extend(Account.prototype, {
	_address: null,
	key: null,
	_balances: null,
	balance: 0,
});

module.exports = {Account};
