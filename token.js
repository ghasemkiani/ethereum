//	@ghasemkiani/ethereum/token

const BigNumber = require("bignumber.js");

const {cutil} = require("@ghasemkiani/commonbase/cutil");
const {Base} = require("@ghasemkiani/commonbase/base");
const {iwutil} = require("@ghasemkiani/ethereum/iwutil");
const {util: utilEth} = require("@ghasemkiani/ethereum/util");
const {Account: EthAccount} = require("@ghasemkiani/ethereum/account");
const {abi: abiERC20} = require("@ghasemkiani/ethereum/erc20");

class Token extends cutil.mixin(Base, iwutil) {
	fromString(string) {
		this.id = string;
	}
	get address() {
		if(!this._address) {
			this._address = this.util.contracts[this.id];
		}
		return this._address;
	}
	set address(address) {
		this._address = address;
	}
	get account() {
		if(!this._account) {
			this._account = new BscAccount({address: this.address});
		}
		return this._account;
	}
	set account(account) {
		this._account = account;
	}
	get contract() {
		if(!this._contract) {
			let web3 = this.util.web3;
			let abi = abiERC20;
			let address = this.address;
			this._contract = new web3.eth.Contract(abi, address);
		}
		return this._contract;
	}
	set contract(contract) {
		this._contract = contract;
	}
	async toUpdate() {
		await this.toGetSymbol();
		await this.toGetName();
		await this.toGetDecimals();
		return this;
	}
	async toGetSymbol() {
		if(cutil.isNil(this.symbol)) {
			this.symbol = await (this.contract.methods.symbol()).call();
		}
		return this.symbol;
	}
	async toGetName() {
		if(cutil.isNil(this.name)) {
			this.name = await (this.contract.methods.name()).call();
		}
		return this.name;
	}
	async toGetDecimals() {
		if(cutil.isNil(this.decimals)) {
			this.decimals = await (this.contract.methods.decimals()).call();
		}
		return this.decimals;
	}
	wrapNumber(n) {
		let decimals = this.decimals;
		if(cutil.isNil(decimals)) {
			throw new Error("Token decimals not fetched!");
		}
		return BigNumber(n).times(BigNumber(10).pow(decimals)).toString();
	}
	unwrapNumber(n) {
		let decimals = this.decimals;
		if(cutil.isNil(decimals)) {
			throw new Error("Token decimals not fetched!");
		}
		return BigNumber(n).times(BigNumber(10).pow(-decimals)).toNumber();
	}
	async toGetTotalSupplyBig() {
		let totalSupply = await (this.contract.methods.totalSupply()).call();
		return totalSupply;
	}
	async toGetTotalSupply() {
		await this.toGetDecimals();
		let totalSupply = await this.toGetTotalSupplyBig();
		totalSupply = this.unwrapNumber(totalSupply);
		return totalSupply;
	}
	async toGetBalanceOfBig(address) {
		let balance = await (this.contract.methods.balanceOf(address)).call();
		return balance;
	}
	async toGetBalanceOf(address) {
		await this.toGetDecimals();
		let balance = await this.toGetBalanceOfBig(address);
		balance = this.unwrapNumber(balance);
		return balance;
	}
}
cutil.extend(Token.prototype, {
	defutil: utilEth,
	id: null,
	decimals: null,
	name: null,
	symbol: null,
	_address: null,
	_contract: null,
});

module.exports = {Token};
