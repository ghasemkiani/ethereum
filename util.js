//	@ghasemkiani/ethereum/util

import Web3 from "web3";
import BigNumber from "bignumber.js";

import {cutil} from "@ghasemkiani/base";
import {Obj} from "@ghasemkiani/base";
import {abi as abiERC20} from "./erc20.js";

class Util extends Obj {
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
			this._web3 = new Web3(this.url || this.provider || Web3.givenProvider);
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
		if(gasLimit > this.gasLimitMax) {
			gasLimit = this.gasLimitMax;
		}
		this.gasLimit = gasLimit;
		return gasLimit;
	}
	fromWei(value) {
		let amount = Web3.utils.fromWei(cutil.asString(value), "ether");
		return cutil.asNumber(amount);
	}
	toWei(amount) {
		let value = Web3.utils.toWei(cutil.asNumber(amount), "ether");
		return value;
	}
	async toGetBlockNumber() {
		let util = this;
		let {web3} = util;
		let blockNumber = await web3.eth.getBlockNumber();
		return blockNumber;
	}
	async toGetBlock(blockNumber) {
		let util = this;
		let {web3} = util;
		let block = await web3.eth.getBlock(blockNumber);
		return block;
	}
	async toGetBlockTimeSec() {
		let util = this;
		let {web3} = util;
		let N = 10000;
		let currentBlock = await util.toGetBlockNumber();
		let {timestamp: timestamp1} = await util.toGetBlock(currentBlock);
		let {timestamp: timestamp0} = await util.toGetBlock(currentBlock - N);
		let blockTimeSec = (cutil.asNumber(timestamp1) - cutil.asNumber(timestamp0)) / N;
		return blockTimeSec;
	}
	async toGetBalance_(walletAddress) {
		let util = this;
		let {web3} = util;
		let balance_ = await web3.eth.getBalance(walletAddress);
		return balance_;
	}
	async toGetBalance(walletAddress) {
		let util = this;
		let {web3} = util;
		let balance_ = await util.toGetBalance_(walletAddress);
		let balance = util.fromWei(balance_);
		return balance;
	}
	async toGetTokenBalanace_(walletAddress, tokenAddress) {
		let web3 = this.web3;
		let abi = abiERC20;
		let contract = new web3.eth.Contract(abi, tokenAddress);
		let balance_ = await (contract.methods.balanceOf(walletAddress)).call();
		return balance_;
	}
	async toGetTokenBalanace(walletAddress, tokenAddress) {
		let web3 = this.web3;
		let abi = abiERC20;
		let contract = new web3.eth.Contract(abi, tokenAddress);
		let decimals = await (contract.methods.decimals()).call();
		let balance_ = await this.toGetTokenBalanace_(walletAddress, tokenAddress);
		let balance = BigNumber(balance_).times(BigNumber(10).pow(-decimals)).toNumber();
		return balance;
	}
	async toGetTransactionFee() {
		let gas = await this.toGetGasLimit();
		let gasPrice = await this.toGetGasPrice();
		let fee = gasPrice * gas;
		return {gas, gasPrice, fee};
	}
	async toTransfer({amount_, amount, toAddress, privateKey}) {
		let web3 = this.web3;
		if(cutil.isNil(this.gasPrice)) {
			await this.toGetGasPrice();
		}
		let gasPrice = this.gasPrice;
		let gas = await this.toGetGasLimit();
		let value = cutil.isNil(amount_) ? Web3.utils.toWei(cutil.asString(amount), "ether") : amount_;
		let to = toAddress;
		let options = {to, value, gas, gasPrice};
		let signed = await web3.eth.accounts.signTransaction(options, privateKey);
		let receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
		return receipt;
	}
	async toTransferToken({amount_, amount, tokenAddress, toAddress, privateKey}) {
		let web3 = this.web3;
		let contract = new web3.eth.Contract(abiERC20, tokenAddress);
		if (cutil.isNil(amount_)) {
			let decimals = await (contract.methods.decimals()).call();
			amount_ = BigNumber(amount).times(BigNumber(10).pow(decimals)).toString();
		}
		let data = contract.methods.transfer(toAddress, amount_).encodeABI();
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
		tokenAddress = cutil.asString(tokenAddress).toLowerCase();
		for(let k of Object.keys(this.contracts)) {
			let tokAddress = this.contracts[k];
			if(tokAddress.toLowerCase() === tokenAddress) {
				tokId = k;
			}
		}
		return tokId;
	}
	eq(address1, address2) {
		return cutil.asString(address1).toLowerCase() === cutil.asString(address2).toLowerCase();
	}
}
cutil.extend(Util.prototype, {
	provider: null,
	tok: "ETH",
	DEFAULT_URL: null,
	NODE_KEY: "ETH_NODE",
	SOLIDITY_MAXINT: (2n ** 256n - 1n).toString(),
	_url: null,
	contracts: {
		"WETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
		"WBTC": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
		"BBTC": "0x9BE89D2a4cd102D8Fecc6BF9dA793be995C22541",
		"USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
		"USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
		"XAUT_OLD": "0x4922a015c4407F87432B179bb209e125432E4a2A",
		"XAUT": "0x68749665FF8D2d112Fa859AA293F07A622782F38",
		"BNB": "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
		"AWC": "0xaD22f63404f7305e4713CcBd4F296f34770513f4",
		"LINK": "0x514910771AF9Ca656af840dff83E8264EcF986CA",
		"FTT": "0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9",
		"THOR": "0xa5f2211B9b8170F694421f2046281775E8468044",
		"LEO": "0x2AF5D2aD76741191D15Dfe7bF6aC92d4Bd912Ca3",
		"LPT": "0x58b6A8A3302369DAEc383334672404Ee733aB239",
		"HT": "0x6f259637dcD74C767781E37Bc6133cd6A68aa161",
		"BUSD": "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
		"TRX": "0xf230b790E05390FC8295F4d3F60332c93BEd42e2",
		"BAT": "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
		"BEAR": "0x016ee7373248a80BDe1fD6bAA001311d233b3CFa",
		"BULL": "0x68eb95Dc9934E19B86687A10DF8e364423240E94",
		"ETHBEAR": "0x2f5e2c9002C058c063d21A06B6cabb50950130c8",
		"ETHBULL": "0x871baeD4088b863fd6407159f3672D70CD34837d",
		"BNBBEAR": "0x6FeBdFC0A9d9502C45343fCE0dF08828dEF44795",
		"BNBBULL": "0x9D1a62c2AD99019768b9126fdA004a9952853F6E",
		"TRXBEAR": "0x86807Da5B92d31F67E128771CAcb85F3579646eA",
		"TRXBULL": "0xc175E77b04F2341517334Ea3Ed0b198A01A97383",
		"EOSBEAR": "0x3d3dd61b0F9A558759a21dA42166042B114E12D5",
		"EOSBULL": "0xeaD7F3ae4e0Bb0D8785852Cc37CC9d0B5e75c06a",
		"BCHBEAR": "0xa9fC65Da36064cE545e87690e06f5de10C52C690",
		"BCHBULL": "0x4C133E081dFB5858e39ccA74E69bf603d409e57A",
		"LTCBEAR": "0xB422e605fBd765B80D2C4b5d8196C2f94144438B",
		"LTCBULL": "0xDB61354E9cf2217a29770E9811832B360a8DAad3",
		"BVOL": "0x81824663353A9d29b01B2DE9dd9a2Bb271d298cD",
		"IBVOL": "0x627e2Ee3dbDA546e168eaAFF25A2C5212E4A95a0",
		"ETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
		"DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
		"ESD": "0x36F3FD68E7325a35EB768F1AedaAe9EA0689d723",
		"BAC": "0x3449FC1Cd036255BA1EB19d65fF4BA2b8903A69a",
		"UST": "0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
		"UNI": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
		"DSD": "0xBD2F0Cd039E0BFcf88901C98c0bFAc5ab27566e3",
		"FRAX": "0x853d955aCEf822Db058eb8505911ED77F175b99e",
		"CORE": "0x62359Ed7505Efc61FF1D56fEF82158CcaffA23D7",
		"DPI": "0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b",
		"AMPL": "0xD46bA6D942050d489DBd938a2C909A5d5039A161",
		"HEZ": "0xEEF9f339514298C6A857EfCfC1A762aF84438dEE",
		"LRC": "0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD",
		"TRU": "0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784",
		"FARM": "0xa0246c9032bC3A600820415aE600c6388619A14D",
		"wANATHA": "0x3383c5a8969Dc413bfdDc9656Eb80A1408E4bA20",
		"YFI": "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
		"AAVE": "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
		"renBTC": "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",
		"TUSD": "0x0000000000085d4780B73119b644AE5ecd22b376",
		"PICKLE": "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
		"BOND": "0x0391D2021f89DC339F60Fff84546EA23E337750f",
		"eXRD": "0x6468e79A80C0eaB0F9A2B574c8d5bC374Af59414",
		"FNK": "0xB5FE099475d3030DDe498c3BB6F3854F762A48Ad",
		"MKR": "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
		"BAS": "0xa7ED29B253D8B4E3109ce07c80fc570f81B63696",
		"CEL": "0xaaAEBE6Fe48E54f431b0C390CfaF0b017d09D42d",
		"HEX": "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39",
		"SNX": "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
		"GRT": "0xc944E90C64B2c07662A292be6244BDf05Cda44a7",
		"ORN": "0x0258F474786DdFd37ABCE6df6BBb1Dd5dfC4434a",
		"DUCK": "0xC0bA369c8Db6eB3924965e5c4FD0b4C1B91e305F",
		"XOR": "0x40FD72257597aA14C7231A7B1aaa29Fce868F677",
		"CVP": "0x38e4adB44ef08F22F5B5b76A8f0c2d0dCbE7DcA1",
		"Yf-DAI": "0xf4CD3d3Fda8d7Fd6C5a500203e38640A70Bf9577",
		"1INCH": "0x111111111117dC0aa78b770fA6A738034120C302",
		"REN": "0x408e41876cCCDC0F92210600ef50372656052a38",
		"SFI": "0xb753428af26E81097e7fD17f40c88aaA3E04902c",
		"DDIM": "0xFbEEa1C75E4c4465CB2FCCc9c6d6afe984558E20",
		"YFIM": "0x2e2f3246b6c65CCc4239c9Ee556EC143a7E5DE2c",
		"EDC": "0xAE66bEa480f7a6C91F07C58f2AEe185883558fb8",
		"UNN": "0x226f7b842E0F0120b7E194D05432b3fd14773a9D",
		"COIN": "0xE61fDAF474Fac07063f2234Fb9e60C1163Cfa850",
		"LID": "0x0417912b3a7AF768051765040A55BB0925D4DDcF",
		"BASE": "0x07150e919B4De5fD6a63DE1F9384828396f25fDC",
		"KP3R": "0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44",
		"DHT": "0xca1207647Ff814039530D7d35df0e1Dd2e91Fa84",
		"POLS": "0x83e6f1E41cdd28eAcEB20Cb649155049Fac3D5Aa",
		"API3": "0x0b38210ea11411557c13457D4dA7dC6ea731B88a",
		"STAKE": "0x0Ae055097C6d159879521C384F1D2123D1f195e6",
		"XIO": "0x0f7F961648aE6Db43C75663aC7E5414Eb79b5704",
		"RFI": "0xA1AFFfE3F4D611d252010E3EAf6f4D77088b0cd7",
		"SWAP": "0xCC4304A31d09258b0029eA7FE63d032f52e44EFe",
		"COMP": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
		"CHAIN": "0xC4C2614E694cF534D407Ee49F8E44D125E4681c4",
		"PNK": "0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d",
		"sUSD": "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
		"MTA": "0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2",
		"SPDR": "0xbcD4b7dE6fde81025f74426D43165a5b0D790Fdd",
		"SURF": "0xEa319e87Cf06203DAe107Dd8E5672175e3Ee976c",
		"RSR": "0x8762db106B2c2A0bccB3A80d1Ed41273552616E8",
		"MPH": "0x8888801aF4d980682e47f1A9036e589479e835C5",
		"DIA": "0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419",
		"STA": "0xa7DE087329BFcda5639247F96140f9DAbe3DeED1",
		"KEEP": "0x85Eee30c52B0b379b046Fb0F85F4f3Dc3009aFEC",
		"BONDLY": "0xD2dDa223b2617cB616c1580db421e4cFAe6a8a85",
		"SHARE": "0x39795344CBCc76cC3Fb94B9D1b15C23c2070C66D",
		"DFD": "0x20c36f062a31865bED8a5B1e512D9a1A20AA333A",
		"UBT": "0x8400D94A5cb0fa0D041a3788e395285d61c9ee5e",
		"CRV": "0xD533a949740bb3306d119CC777fa900bA034cd52",
		"ROOK": "0xfA5047c9c78B8877af97BDcb85Db743fD7313d4a",
		"OCEAN": "0x967da4048cD07aB37855c090aAF366e4ce1b9F48",
		"ALBT": "0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0",
		"wNXM": "0x0d438F3b5175Bebc262bF23753C1E53d03432bDE",
		"XRT": "0x7dE91B204C1C737bcEe6F000AAA6569Cf7061cb7",
		"KNC": "0xdd974D5C2e2928deA5F71b9825b8b646686BD200",
		"MEME": "0xD5525D397898e5502075Ea5E830d8914f6F0affe",
		"RPL": "0xB4EFd85c19999D84251304bDA99E90B92300Bd93",
		"UMA": "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",
		"OCTO": "0x7240aC91f01233BaAf8b064248E80feaA5912BA3",
		"CIBS": "0x51b4b27a7bD296FD34cA7C469F49d5bcD7Fe5137",
		"GHST": "0x3F382DbD960E3a9bbCeaE22651E88158d2791550",
		"DEGO": "0x88EF27e69108B2633F8E1C184CC37940A075cC02",
		"YAX": "0xb1dC9124c395c1e97773ab855d66E879f053A289",
		"BID": "0x25e1474170c4c0aA64fa98123bdc8dB49D7802fa",
		"UMEX": "0x27AF23d8db2a3FbCe7d04E84f594285fB0059316",
		"DF": "0x431ad2ff6a9C365805eBaD47Ee021148d6f7DBe0",
		"DMG": "0xEd91879919B71bB6905f23af0A68d231EcF87b14",
		"RFuel": "0xaf9f549774ecEDbD0966C52f250aCc548D3F36E5",
		"PRQ": "0x362bc847A3a9637d3af6624EeC853618a43ed7D2",
		"YFIG": "0xc36F33A94D371eF4dfbEAE8D50d3520aC02A41DE",
		"YFL": "0x28cb7e841ee97947a86B06fA4090C8451f64c0be",
		"MAHA": "0xB4d930279552397bbA2ee473229f89Ec245bc365",
		"SHROOM": "0xEd0439EACf4c4965AE4613D77a5C2Efe10e5f183",
		"NOIA": "0xa8c8CfB141A3bB59FEA1E2ea6B79b5ECBCD7b6ca",
		"CFi": "0x63b4f3e3fa4e438698CE330e365E831F7cCD1eF4",
		"FSW": "0xfffffffFf15AbF397dA76f1dcc1A1604F45126DB",
		"XFI": "0x5BEfBB272290dD5b8521D4a938f6c4757742c430",
		"TRADE": "0x6F87D756DAf0503d08Eb8993686c7Fc01Dc44fB1",
		"APY": "0x95a4492F028aa1fd432Ea71146b433E7B4446611",
		"AKRO": "0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7",
		"CHADS": "0x69692D3345010a207b759a7D1af6fc7F38b35c5E",
		"OWL": "0x2a7f709eE001069771ceB6D42e85035f7D18E736",
		"xBTC": "0xECbF566944250ddE88322581024E611419715f7A",
		"SUSHI": "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
		"AUDIO": "0x18aAA7115705e8be94bfFEBDE57Af9BFc265B998",
		"yyDAI+yUSDC+yUSDT+yTUSD": "0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c",
		"ORO": "0xc3Eb2622190c57429aac3901808994443b64B466",
		"QNT": "0x4a220E6096B25EADb88358cb44068A3248254675",
		"CREAM": "0x2ba592F78dB6436527729929AAf6c908497cB200",
		"UFT": "0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1",
		"STRONG": "0x990f341946A3fdB507aE7e52d17851B87168017c",
		"ORAI": "0x4c11249814f11b9346808179Cf06e71ac328c1b5",
		"BAL": "0xba100000625a3754423978a60c9317c58a424e3D",
		"BNSD": "0x668DbF100635f593A3847c0bDaF21f0a09380188",
		"RING": "0x9469D013805bFfB7D3DEBe5E7839237e535ec483",
		"GAIN": "0xFcce65a70794BeC59e5Be38c85ebe71aEdaA74ef",
		"BZRX": "0x56d811088235F11C8920698a204A5010a788f4b3",
		"DEXT": "0x26CE25148832C04f3d7F26F32478a9fe55197166",
		"CTC": "0x6378930da9be7C90d824d7f113974741644d62dA",
		"EPAN": "0x72630B1e3B42874bf335020Ba0249e3E9e47Bafc",
		"LEND": "0x80fB784B7eD66730e8b1DBd9820aFD29931aab03",
		"POND": "0x57B946008913B82E4dF85f501cbAeD910e58D26C",
		"BART": "0x54C9EA2E9C9E8eD865Db4A4ce6711C2a0d5063Ba",
		"BAND": "0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55",
		"FXS": "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
		"ZEFU": "0xB1e9157c2Fdcc5a856C8DA8b2d89b6C32b3c1229",
		"HEGIC": "0x584bC13c7D411c00c01A62e8019472dE68768430",
		"RMPL": "0xE17f017475a709De58E976081eB916081ff4c9d5",
		"COVER": "0x5D8d9F5b96f4438195BE9b99eee6118Ed4304286",
		"SMARTCREDIT": "0x72e9D9038cE484EE986FEa183f8d8Df93f9aDA13",
		"SXP": "0x8CE9137d39326AD0cD6491fb5CC0CbA0e089b6A9",
		"DOKI": "0x9cEB84f92A0561fa3Cc4132aB9c0b76A59787544",
		"LAYER": "0x0fF6ffcFDa92c53F615a4A75D982f399C989366b",
		"Nsure": "0x20945cA1df56D237fD40036d47E866C7DcCD2114",
		"DZAR": "0x9Cb2f26A23b8d89973F08c957C4d7cdf75CD341c",
		"ANT": "0x960b236A07cf122663c4303350609A66A7B288C0",
		"TRB": "0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5",
		"HAKKA": "0x0E29e5AbbB5FD88e28b2d355774e73BD47dE3bcd",
		"KTLYO": "0x24E3794605C84E580EEA4972738D633E8a7127c8",
		"DOS": "0x0A913beaD80F321E7Ac35285Ee10d9d922659cB7",
		"ETHV": "0xEeEeeeeEe2aF8D0e1940679860398308e0eF24d6",
		"VOX": "0x12D102F06da35cC0111EB58017fd2Cd28537d0e1",
		"DEC": "0x30f271C9E86D2B7d00a6376Cd96A1cFBD5F0b9b3",
		"KEN": "0x6A7Ef4998eB9d0f706238756949F311a59E05745",
		"DTA": "0x31497f218c005fE3d5eE87e5a33e133A909A7a4b",
		"XAMP": "0xf911a7ec46a2c6fa49193212fe4a2a9B95851c27",
		"RBASE": "0xE8b251822d003a2b2466ee0E38391C2db2048739",
		"OM": "0x2baEcDf43734F22FD5c152DB08E3C27233F0c7d2",
		"BOOST": "0x3e780920601D61cEdb860fe9c4a90c9EA6A35E78",
		"FLOW": "0xC6e64729931f60D2c8Bc70A27D66D9E0c28D1BF9",
		"ROT": "0xD04785C4d8195e4A54d9dEc3a9043872875ae9E2",
		"SYN": "0x1695936d6a953df699C38CA21c2140d497C08BD9",
		"KIF": "0x177BA0cac51bFC7eA24BAd39d81dcEFd59d74fAa",
		"YFII": "0xa1d0E215a23d7030842FC67cE582a6aFa3CCaB83",
		"KTON": "0x9F284E1337A815fe77D2Ff4aE46544645B20c5ff",
		"SBTC": "0x309013d55fB0E8C17363bcC79F25d92f711A5802",
		"YELD": "0x468ab3b1f63A1C14b361bC367c3cC92277588Da1",
		"TOMOE": "0x05D3606d5c81EB9b7B18530995eC9B29da05FaBa",
		"BMJ": "0x5913D0F34615923552ee913DBe809F9F348e706E",
		"SWRV": "0xB8BAa0e4287890a5F79863aB62b7F175ceCbD433",
		"SRM": "0x476c5E26a75bd202a9683ffD34359C0CC15be0fF",
		"KIMCHI": "0x1E18821E69B9FAA8e6e75DFFe54E7E25754beDa0",
		"zLOT": "0xA8e7AD77C60eE6f30BaC54E2E7c0617Bd7B5A03E",
		"$BASED": "0x68A118Ef45063051Eac49c7e647CE5Ace48a68a5",
		"yDAI+yUSDC+yUSDT+yTUSD": "0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8",
		"DRC": "0xb78B3320493a4EFaa1028130C5Ba26f0B6085Ef8",
		"YFBETA": "0x89eE58Af4871b474c30001982c3D7439C933c838",
		"TEND": "0x1453Dbb8A29551ADe11D89825CA812e05317EAEB",
		"ZZZ": "0xc75F15AdA581219c95485c578E124df3985e4CE0",
		"DCORE": "0xb944B46Bbd4ccca90c962EF225e2804E46691cCF",
		"BOT": "0x5bEaBAEBB3146685Dd74176f68a0721F91297D37",
		"ELF": "0xbf2179859fc6D5BEE9Bf9158632Dc51678a4100e",
		"SASHIMI": "0xC28E27870558cF22ADD83540d2126da2e4b464c2",
		"ENCORE": "0xe0E4839E0c7b2773c58764F9Ec3B9622d01A0428",
		"YFV": "0x45f24BaEef268BB6d63AEe5129015d69702BCDfa",
		"MOON": "0x68a3637bA6E75c0f66B61A42639c4e9fCD3D4824",
		"XSP": "0x9b06D48E0529ecF05905fF52DD426ebEc0EA3011",
		"SLINK": "0x10Bae51262490B4f4AF41e12eD52A0E744c1137A",
		"YAM": "0x0e2298E3B3390e3b945a5456fBf59eCc3f55DA16",
		"YAMv2": "0xAba8cAc6866B83Ae4eec97DD07ED254282f6aD8A",
		"AXN": "0x7D85e23014F84E6E21d5663aCD8751bEF3562352",
		"TGX": "0x364A7381A5b378CeD7AB33d1CDf6ff1bf162Bfd6",
		"LUA": "0xB1f66997A5760428D3a87D68b90BfE0aE64121cC",
		"YUNO": "0x4B4F5286e0f93E965292B922B9Cd1677512F1222",
		"SAKE": "0x066798d9ef0833ccc719076Dab77199eCbd178b0",
		"OPEN": "0x69e8b9528CABDA89fe846C67675B5D73d463a916",
		"SHIB": "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
		"Uni-v3": "0x4D8df3CD11236Abd95A31De0c68495e5cF3B05a4",
		"GTC": "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F",
		"MATIC": "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
		"RUNE": "0x3155BA85D5F96b2d030a4966AF206230e46849cb",
		"TONCOIN": "0x582d872A1B094FC48F5DE31D3B73F2D9bE47def1",
	},
	tokenDecimals: {},
	contractProxies: {
		"0x9BE89D2a4cd102D8Fecc6BF9dA793be995C22541": "0x9F344834752cb3a8C54c3DdCd41Da4042b10D0b9",
		"0x68749665FF8D2d112Fa859AA293F07A622782F38": "0xd131ef0Fc4Ae1Af2e1CA3641a8E542731E3B36B4",
	},
	gasPrice: null,
	gasLimit: null,
	gasLimitMax: 500000,
	gasK: 1,
});

const util = new Util();

export {Util, util};
