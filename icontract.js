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
		let contract = this;
		let {account} = contract;
		let {util} = contract;
		let {web3} = util;
		let from = account.address;
		let to = contract.address;
		let gas = await web3.eth.estimateGas({from, to, data});
		gas = d(gas).mul(util.gasLimitK).toFixed(0);
		gas = cutil.asInteger(gas);
		return gas;
	},
	async toSendData(data, value = 0) {
		let contract = this;
		let {account} = contract;
		let {util} = contract;
		let {web3} = util;
		let to = contract.address;
		let gasPrice = await util.toGetGasPrice();
		let gas;
		try {
			gas = await contract.toEstimateGas(data);
		} catch(e) {
			gas = util.gasLimitMax;
		}
		let options = {to, value, gas, gasPrice, data};
		console.log(options);
		let receipt = await account.toSend(options);
		return receipt;
	},
	findFunction(nm, index = 0) {
		let {abi} = this;
		let types;
		let result = /^([^(]+)\(([^)]*)\)$/.exec(nm);
		if (result) {
			nm = result[1];
			types = result[2].split(",");
		}
		let items = abi.filter(({type, name, inputs}) => type === "function" && name === nm && (!types || (inputs.length === types.length && inputs.every(({type}, i) => type === types[i]))));
		return items[index];
	},
	findEvent(nm, index = 0) {
		let {abi} = this;
		let types;
		let result = /^([^(]+)\(([^)]*)\)$/.exec(nm);
		if (result) {
			nm = result[1];
			types = result[2].split(",");
		}
		let items = abi.filter(({type, name, inputs}) => type === "event" && name === nm && (!types || (inputs.length === types.length && inputs.every(({type}, i) => type === types[i]))));
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
