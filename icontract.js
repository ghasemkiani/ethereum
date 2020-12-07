//	@ghasemkiani/ethereum/icontract
const {cutil} = require("@ghasemkiani/commonbase/cutil");

const icontract = {
	abi: null,
	async toGetAbi() {
		if(!this.abi) {
			let address = this.address;
			this.abi = await this.scan.toGetContractAbi(address);
		}
		return this.abi;
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
	}
};

module.exports = {icontract};
