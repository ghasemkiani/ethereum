//	@ghasemkiani/ethereum/itoken

const BigNumber = require("bignumber.js");

const {cutil} = require("@ghasemkiani/commonbase/cutil");

const itoken = {
	id: null,
	decimals: null,
	name: null,
	symbol: null,
	fromString(string) {
		this.id = string;
	},
	get address() {
		if(!this._address) {
			this._address = this.util.contracts[this.id];
		}
		return this._address;
	},
	set address(address) {
		this._address = address;
	},
	async toUpdate() {
		await this.toGetAbi();
		await this.toGetSymbol();
		await this.toGetName();
		await this.toGetDecimals();
		return this;
	},
	async toGetSymbol() {
		if(cutil.isNil(this.symbol)) {
			this.symbol = await (this.contract.methods.symbol()).call();
		}
		return this.symbol;
	},
	async toGetName() {
		if(cutil.isNil(this.name)) {
			this.name = await (this.contract.methods.name()).call();
		}
		return this.name;
	},
	async toGetDecimals() {
		if(cutil.isNil(this.decimals)) {
			this.decimals = await (this.contract.methods.decimals()).call();
		}
		return this.decimals;
	},
	wrapNumber(n) {
		let decimals = this.decimals;
		if(cutil.isNil(decimals)) {
			throw new Error("Token decimals not fetched!");
		}
		return BigNumber(n).times(BigNumber(10).pow(decimals)).idiv(1).toString();
	},
	unwrapNumber(n) {
		let decimals = this.decimals;
		if(cutil.isNil(decimals)) {
			throw new Error("Token decimals not fetched!");
		}
		return BigNumber(n).times(BigNumber(10).pow(-decimals)).toNumber();
	},
	async toGetTotalSupplyBig() {
		let totalSupply = await (this.contract.methods.totalSupply()).call();
		return totalSupply;
	},
	async toGetTotalSupply() {
		await this.toGetDecimals();
		let totalSupply = await this.toGetTotalSupplyBig();
		totalSupply = this.unwrapNumber(totalSupply);
		return totalSupply;
	},
	async toGetBalanceOfBig(address) {
		let balance = await (this.contract.methods.balanceOf(address)).call();
		return balance;
	},
	async toGetBalanceOf(address) {
		await this.toGetDecimals();
		let balance = await this.toGetBalanceOfBig(address);
		balance = this.unwrapNumber(balance);
		return balance;
	},
}

module.exports = {itoken};
