//	@ghasemkiani/ethereum/util

const Web3 = require("web3");
const BigNumber = require("bignumber.js");

const {cutil} = require("@ghasemkiani/commonbase/cutil");
const {Base} = require("@ghasemkiani/commonbase/base");
const {abi: abiERC20} = require("@ghasemkiani/ethereum/erc20");

class Util extends Base {
	get url() {
		if(!this._url) {
			this._url = process.env[this.NODE_KEY] || this.DEFAULT_URL;
		}
		return this._url;
	}
	set url(url) {
		this._url = url;
	}
	get web3() {
		if(!this._web3) {
			this._web3 = new Web3(this.url || Web3.givenProvider);
		}
		return this._web3;
	}
	set web3(web3) {
		this._web3 = web3;
	}
	async toGetGasPrice() {
		let web3 = this.web3;
		let gasPrice = await web3.eth.getGasPrice();
		this.gasPrice = gasPrice;
		return gasPrice;
	}
	async toGetGasLimit() {
		let web3 = this.web3;
		let gasLimit = (await web3.eth.getBlock("latest")).gasLimit;
		gasLimit = cutil.asNumber(gasLimit);
		if(gasLimit > 500_000) {
			gasLimit = 500_000;
		}
		this.gasLimit = gasLimit;
		return gasLimit;
	}
	toWei(amount) {
		let value = Web3.utils.toWei(cutil.asString(amount), "ether");
		return value;
	}
	async toGetBalance(walletAddress) {
		let web3 = this.web3;
		let balance = await web3.eth.getBalance(walletAddress);
		balance = BigNumber(balance).times(BigNumber(10).pow(-18)).toNumber();
		return balance;
	}
	async toGetTokenBalanace(walletAddress, tokenAddress) {
		let web3 = this.web3;
		let abi = abiERC20;
		let contract = new web3.eth.Contract(abi, tokenAddress);
		let decimals = await (contract.methods.decimals()).call();
		let balance = await (contract.methods.balanceOf(walletAddress)).call();
		balance = BigNumber(balance).times(BigNumber(10).pow(-decimals)).toNumber();
		return balance;
	}
	async toGetTransactionFee() {
		let gas = await this.toGetGasLimit();
		let gasPrice = await this.toGetGasPrice();
		let fee = gasPrice * gas;
		return {gas, gasPrice, fee};
	}
	async toTransfer({amount, toAddress, privateKey}) {
		let web3 = this.web3;
		if(cutil.isNil(this.gasPrice)) {
			await this.toGetGasPrice();
		}
		let gasPrice = this.gasPrice;
		let gas = await this.toGetGasLimit();
		let value = Web3.utils.toWei(cutil.asString(amount), "ether");
		let to = toAddress;
		let options = {to, value, gas, gasPrice};
		let signed = await web3.eth.accounts.signTransaction(options, privateKey);
		let receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
		return receipt;
	}
	async toTransferToken({amount, tokenAddress, toAddress, privateKey}) {
		let web3 = this.web3;
		let abi = abiERC20;
		let contract = new web3.eth.Contract(abi, tokenAddress);
		let decimals = await (contract.methods.decimals()).call();
		amount = BigNumber(amount).times(BigNumber(10).pow(decimals)).toString();
		let data = contract.methods.transfer(toAddress, amount).encodeABI();
		let value = 0; // ETH
		let to = tokenAddress;
		if(cutil.isNil(this.gasPrice)) {
			await this.toGetGasPrice();
		}
		let gasPrice = this.gasPrice;
		if(cutil.isNil(this.gasLimit)) {
			await this.toGetGasLimit();
		}
		let gas = this.gasLimit;
		console.log({to, value, data, gas, gasPrice});
		let options = {to, value, data, gas, gasPrice};
		let signed = await web3.eth.accounts.signTransaction(options, privateKey);
		let receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
		return receipt;
	}
	tokenAddress(tokenId) {
		return this.contracts[tokenId];
	}
	tokenId(tokenAddress) {
		let tokId;
		for(let k of Object.keys(this.contracts)) {
			let tokAddress = this.contracts[k];
			if(tokAddress.toLowerCase() === tokenAddress.toLowerCase()) {
				tokId = k;
			}
		}
		return tokId;
	}
}
cutil.extend(Util.prototype, {
	tok: "ETH",
	DEFAULT_URL: null,
	NODE_KEY: "ETH_NODE",
	_url: null,
	contracts: {
		"USDT": "0xdac17f958d2ee523a2206206994597c13d831ec7",
		"XAUT": "0x4922a015c4407F87432B179bb209e125432E4a2A",
		"BNB": "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
		"AWC": "0xad22f63404f7305e4713ccbd4f296f34770513f4",
		"LINK": "0x514910771af9ca656af840dff83e8264ecf986ca",
		"LEO": "0x2af5d2ad76741191d15dfe7bf6ac92d4bd912ca3",
		"LPT": "0x58b6A8A3302369DAEc383334672404Ee733aB239", // Livepeer
		"HT": "0x6f259637dcd74c767781e37bc6133cd6a68aa161",
		"USDC": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
		"BUSD": "0x4fabb145d64652a948d72533023f6e7a623c7c53",
		"TRX": "0xf230b790e05390fc8295f4d3f60332c93bed42e2",
		"BAT": "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
		"BEAR": "0x016ee7373248a80BDe1fD6bAA001311d233b3CFa",
		"BULL": "0x68eb95Dc9934E19B86687A10DF8e364423240E94",
		"ETHBEAR": "0x2f5e2c9002c058c063d21a06b6cabb50950130c8",
		"ETHBULL": "0x871baeD4088b863fd6407159f3672D70CD34837d",
		"BNBBEAR": "0x6febdfc0a9d9502c45343fce0df08828def44795",
		"BNBBULL": "0x9d1a62c2ad99019768b9126fda004a9952853f6e",
		"TRXBEAR": "0x86807da5b92d31f67e128771cacb85f3579646ea",
		"TRXBULL": "0xc175e77b04f2341517334ea3ed0b198a01a97383",
		"EOSBEAR": "0x3d3dd61b0f9a558759a21da42166042b114e12d5",
		"EOSBULL": "0xead7f3ae4e0bb0d8785852cc37cc9d0b5e75c06a",
		"BCHBEAR": "0xa9fc65da36064ce545e87690e06f5de10c52c690",
		"BCHBULL": "0x4c133e081dfb5858e39cca74e69bf603d409e57a",
		"LTCBEAR": "0xb422e605fbd765b80d2c4b5d8196c2f94144438b",
		"LTCBULL": "0xdb61354e9cf2217a29770e9811832b360a8daad3",
		"BVOL": "0x81824663353a9d29b01b2de9dd9a2bb271d298cd",
		"IBVOL": "0x627e2ee3dbda546e168eaaff25a2c5212e4a95a0",
	},
	gasPrice: null,
	gasLimit: null,
});

const util = new Util();

module.exports = {Util, util};
