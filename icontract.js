//	@ghasemkiani/ethereum/icontract

import d from "decimal.js";

import {cutil} from "@ghasemkiani/base";

const icontract = {
	abi: null,
	async toGetAbi() {
		if(!this.abi) {
			let address = this.address;
			if(address in this.util.contractProxies) {
				address = this.util.contractProxies[address];
			}
			this.abi = await this.scan.toGetContractAbi(address);
		}
		return this.abi;
	},
	async toRemoveAbiFromCache() {
		let address = this.address;
		let result = this.scan.toRemoveContractAbiFromCache(address);
		return result;
	},
	_contract: null,
	get contract() {
		if(!this._contract) {
			let web3 = this.util.web3;
			let {abi, address} = this;
			this._contract = new web3.eth.Contract(abi, address);
		}
		return this._contract;
	},
	set contract(contract) {
		this._contract = contract;
	},
	account: null,
	async toEstimateGas(data) {
		let from = this.account.address;
		let to = this.address;
		let gasLimit = await this.util.web3.eth.estimateGas({from, to, data});
		gasLimit = d(gasLimit).mul(this.util.gasLimitK).toFixed(0);
		gasLimit = cutil.asInteger(gasLimit);
		return gasLimit;
	},
	async toSendData(data, value = 0) {
		let to = this.address;
		if(cutil.isNil(this.util.gasPrice)) {
			await this.util.toGetGasPrice();
		}
		let gasPrice = this.util.gasPrice;
		if(cutil.isNil(this.util.gasLimit)) {
			await this.util.toGetGasLimit();
		}
		// let gas = this.util.gasLimit;
		let gas = await this.toEstimateGas(data);
		console.log({to, value, gas, gasPrice, data});
		let options = {to, value, gas, gasPrice, data};
		let receipt = await this.account.toSend(options);
		return receipt;
	},
	findFunction(nm, index = 0) {
		let {abi} = this;
		let items = abi.filter(({type, name}) => type === "function" && name === nm);
		return items[index];
	},
	findEvent(nm, index = 0) {
		let {abi} = this;
		let items = abi.filter(({type, name}) => type === "event" && name === nm);
		return items[index];
	},
	functionData(func, ...rest) {
		let {web3} = this.util;
		let data = web3.eth.abi.encodeFunctionCall(func, rest);
		return data;
	},
	callData(nm, ...rest) {
		let func = this.findFunction(nm);
		let data = this.functionData(func, ...rest);
		return data;
	},
	async toCallRead(method, ...rest) {
		let result = await this.contract.methods[method](...rest).call();
		return result;
	},
	async toCallWriteWithValue(value, method, ...rest) {
		let data = await this.contract.methods[method](...rest).encodeABI();
		let result = await this.toSendData(data, value);
		return result;
	},
	async toCallWrite(method, ...rest) {
		let value = 0;
		let result = await this.toCallWriteWithValue(value, method, ...rest);
		return result;
	},
};

export {icontract};
