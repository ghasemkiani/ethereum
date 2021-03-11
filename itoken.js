//	@ghasemkiani/ethereum/itoken

const {BigNumber} = require("bignumber.js");

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
		return BigNumber(n).times(BigNumber(10).pow(decimals)).idiv(1).toFixed(0);
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
		await this.toGetAbi();
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
		await this.toGetAbi();
		await this.toGetDecimals();
		let balance = await this.toGetBalanceOfBig(address);
		balance = this.unwrapNumber(balance);
		return balance;
	},
	async toGetAccountBalanceBig() {
		let address = this.account.address;
		return await this.toGetBalanceOfBig(address);
	},
	async toGetAccountBalance() {
		let address = this.account.address;
		return await this.toGetBalanceOf(address);
	},
	async toTransferBig(to, value) {
		let data = this.contract.methods.transfer(to, value).encodeABI();
		let result = await this.toSendData(data);
		return result;
	},
	async toTransfer(to, amount) {
		await this.toGetAbi();
		await this.toGetDecimals();
		let value = this.wrapNumber(amount);
		return this.toTransferBig(to, value);
	},
	async toTransferFromBig(from, to, value) {
		let data = this.contract.methods.transferFrom(from, to, value).encodeABI();
		let result = await this.toSendData(data);
		return result;
	},
	async toTransferFrom(from, to, amount) {
		await this.toGetAbi();
		await this.toGetDecimals();
		let value = this.wrapNumber(amount);
		return this.toTransferFromBig(from, to, value);
	},
	async toApproveBig(spender, value) {
		let data = this.contract.methods.approve(spender, value).encodeABI();
		let result = await this.toSendData(data);
		return result;
	},
	async toApprove(spender, amount) {
		await this.toGetAbi();
		await this.toGetDecimals();
		let value = this.wrapNumber(amount);
		return this.toApprove(spender, amount);
	},
	async toGetAllowanceBig(owner, spender) {
		let allowance = await this.contract.methods.allowance(owner, spender).call();
		return allowance;
	},
	async toGetAllowance(owner, spender) {
		await this.toGetAbi();
		await this.toGetDecimals();
		let allowance = await this.toGetAllowanceBig(owner, spender);
		allowance = this.unwrapNumber(allowance);
		return allowance;
	},
}

module.exports = {itoken};
