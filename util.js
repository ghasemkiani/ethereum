//	@ghasemkiani/ethereum/util

const Web3 = require("web3");
const BigNumber = require("bignumber.js");

const {cutil} = require("@ghasemkiani/commonbase/cutil");
const {Base} = require("@ghasemkiani/commonbase/base");

class Util extends Base {
	get url() {
		if(!this._url) {
			this._url = process.env.ETH_NODE;
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
	async toGetBalance(walletAddress) {
		let web3 = this.web3;
		let balance = await web3.eth.getBalance(walletAddress);
		balance = BigNumber(balance).times(BigNumber(10).pow(-18)).toNumber();
		return balance;
	}
	async toGetTokenBalanace(walletAddress, tokenAddress) {
		let web3 = this.web3;
		let abi = [
			{
				"constant": true,
				"inputs": [{"name": "_owner", "type": "address"}],
				"name": "balanceOf",
				"outputs": [{"name": "balance", "type": "uint256"}],
				"type": "function"
			},
			{
				"constant": true,
				"inputs": [],
				"name": "decimals",
				"outputs": [{"name": "", "type": "uint8"}],
				"type": "function"
			}
		];
		let contract = new web3.eth.Contract(abi, tokenAddress);
		let decimals = await (contract.methods.decimals()).call();
		let balance = await (contract.methods.balanceOf(walletAddress)).call();
		// balance = Number(balance) * (10 ** (-decimals));
		balance = BigNumber(balance).times(BigNumber(10).pow(-decimals)).toNumber();
		return balance;
	}
	async toTransferToken({amount, tokenAddress, toAddress}) {
		let web3 = this.web3;
		let decimals = web3.toBigNumber(18);
		amount = web3.toBigNumber(amount);
		let abi = [{
			"constant": false,
			"inputs": [
				{"name": "_to", "type": "address"},
				{"name": "_value", "type": "uint256"},
			],
			"name": "transfer",
			"outputs": [
				{"name": "", "type": "bool"},
			],
			"type": "function",
		}];
		let contract = web3.eth.contract(abi).at(tokenAddress);
		let value = amount.times(web3.toBigNumber(10).pow(decimals));
		return new Promise((resolve, reject) => {
			try {
				contract.transfer(toAddress, value, (error, txHash) => {
					if(error) {
						reject(error);
					} else {
						resolve(txHash);
					}
				});
			} catch(e) {
				reject(e);
			}
		});
	}
}
cutil.extend(Util.prototype, {
	_url: null,
	contracts: {
		"USDT": "0xdac17f958d2ee523a2206206994597c13d831ec7",
		"XAUT": "0x4922a015c4407F87432B179bb209e125432E4a2A",
		"BNB": "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
		"AWC": "0xad22f63404f7305e4713ccbd4f296f34770513f4",
		"LINK": "0x514910771af9ca656af840dff83e8264ecf986ca",
		"LEO": "0x2af5d2ad76741191d15dfe7bf6ac92d4bd912ca3",
		"HT": "0x6f259637dcd74c767781e37bc6133cd6a68aa161",
		"USDC": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
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
	},
});

const util = new Util();

module.exports = {Util, util};
