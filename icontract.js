//	@ghasemkiani/ethereum/icontract

const icontract = {
	abi: null,
	async toGetAbi() {
		let address = this.address;
		let abi = await this.scan.toGetContractAbi(address);
		this.abi = abi;
		return abi;
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
};

module.exports = {icontract};
