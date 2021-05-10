//	@ghasemkiani/ethereum/itoken

const {BigNumber} = require("bignumber.js");

const {cutil} = require("@ghasemkiani/base/cutil");

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
		try {
			if(cutil.isNil(this.decimals)) {
				this.decimals = await (this.contract.methods.decimals()).call();
			}
			return this.decimals;
		} catch(e) {
			if(this.id in this.util.tokenDecimals) {
				this.decimals = this.util.tokenDecimals[this.id];
				return this.decimals;
			} else {
				throw e;
			}
		}
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
	async toGetTotalSupply_() {
		let totalSupply_ = await (this.contract.methods.totalSupply()).call();
		return totalSupply_;
	},
	async toGetTotalSupply() {
		await this.toGetAbi();
		await this.toGetDecimals();
		let totalSupply_ = await this.toGetTotalSupply_();
		let totalSupply = this.unwrapNumber(totalSupply_);
		return totalSupply;
	},
	async toGetBalanceOf_(address) {
		let balance_ = await (this.contract.methods.balanceOf(address)).call();
		return balance_;
	},
	async toGetBalanceOf(address) {
		await this.toGetAbi();
		await this.toGetDecimals();
		let balance_ = await this.toGetBalanceOf_(address);
		let balance = this.unwrapNumber(balance_);
		return balance;
	},
	async toGetAccountBalance_() {
		let address = this.account.address;
		let balance_ = await this.toGetBalanceOf_(address);
		return balance_;
	},
	async toGetAccountBalance() {
		let address = this.account.address;
		return await this.toGetBalanceOf(address);
	},
	async toTransfer_(to, amount_) {
		let data = this.contract.methods.transfer(to, amount_).encodeABI();
		let result = await this.toSendData(data);
		return result;
	},
	async toTransfer(to, amount) {
		await this.toGetAbi();
		await this.toGetDecimals();
		let amount_ = this.wrapNumber(amount);
		return this.toTransfer_(to, amount_);
	},
	async toTransferFrom_(from, to, amount_) {
		let data = this.contract.methods.transferFrom(from, to, amount_).encodeABI();
		let result = await this.toSendData(data);
		return result;
	},
	async toTransferFrom(from, to, amount) {
		await this.toGetAbi();
		await this.toGetDecimals();
		let amount_ = this.wrapNumber(amount);
		return this.toTransferFrom_(from, to, amount_);
	},
	async toApprove_(spender, amount_) {
		let data = this.contract.methods.approve(spender, amount_).encodeABI();
		let result = await this.toSendData(data);
		return result;
	},
	async toApprove(spender, amount) {
		await this.toGetAbi();
		await this.toGetDecimals();
		let amount_ = this.wrapNumber(amount);
		return this.toApprove_(spender, amount_);
	},
	async toGetAllowance_(owner, spender) {
		let allowance_ = await this.contract.methods.allowance(owner, spender).call();
		return allowance_;
	},
	async toGetAllowance(owner, spender) {
		await this.toGetAbi();
		await this.toGetDecimals();
		let allowance_ = await this.toGetAllowance_(owner, spender);
		let allowance = this.unwrapNumber(allowance_);
		return allowance;
	},
	async toGetAccountAllowance_(spender) {
		let owner = this.account.address;
		let allowance_ = await this.toGetAllowance_(owner, spender);
		return allowance_;
	},
	async toGetAccountAllowance(spender) {
		let owner = this.account.address;
		let allowance = await this.toGetAllowance(owner, spender);
		return allowance;
	},
}

module.exports = {itoken};
