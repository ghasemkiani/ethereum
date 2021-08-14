//	@ghasemkiani/ethereum/icontract

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
	async toSendData(data, value = 0) {
		let to = this.address;
		if(cutil.isNil(this.util.gasPrice)) {
			await this.util.toGetGasPrice();
		}
		let gasPrice = this.util.gasPrice;
		if(cutil.isNil(this.util.gasLimit)) {
			await this.util.toGetGasLimit();
		}
		let gas = this.util.gasLimit;
		console.log({to, value, gas, gasPrice, data});
		let options = {to, value, gas, gasPrice, data};
		let receipt = await this.account.toSend(options);
		return receipt;
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
