//	@ghasemkiani/ethereum/account

import Web3 from "web3";
import BigNumber from "bignumber.js";

import {cutil} from "@ghasemkiani/base";
import {Obj} from "@ghasemkiani/base";
import {Client} from "@ghasemkiani/etherscan-api";
import {iwutil} from "./iwutil.js";
import {util as utilEth} from "./util.js";
import {iwscan} from "./iwscan.js";

class Account extends cutil.mixin(Obj, iwutil, iwscan) {
	get address() {
		if(!this._address && this.key) {
			let web3 = this.util.web3;
			let privateKey = this.key;
			this._address = web3.eth.accounts.privateKeyToAccount(privateKey).address;
		}
		return this._address;
	}
	set address(address) {
		this._address = address;
	}
	toChecksumAddress() {
		this.address = Web3.utils.toChecksumAddress(this.address);
		return this;
	}
	get balances_() {
		if(!this._balances_) {
			this._balances_ = {};
		}
		return this._balances_;
	}
	set balances_(balances_) {
		this._balances_ = balances_;
	}
	get balance_() {
		return this.balances_[this.util.tok];
	}
	set balance_(balance_) {
		this.balances_[this.util.tok] = balance_;
	}
	get balances() {
		if(!this._balances) {
			this._balances = {};
		}
		return this._balances;
	}
	set balances(balances) {
		this._balances = balances;
	}
	get balance() {
		return this.balances[this.util.tok];
	}
	set balance(balance) {
		this.balances[this.util.tok] = balance;
	}
	async toGetBalance_() {
		let walletAddress = this.address;
		let balance_ = await this.util.toGetBalance_(walletAddress);
		this.balance_ = balance_;
		return balance_;
	}
	async toGetBalance() {
		let web3 = this.util.web3;
		let walletAddress = this.address;
		let balance = await this.util.toGetBalance(walletAddress);
		this.balance = balance;
		return balance;
	}
	async toGetTokenBalance_(token) {
		if(token === this.util.tok) {
			return await this.toGetBalance_();
		} else {
			let web3 = this.util.web3;
			let walletAddress = this.address;
			let tokenAddress = this.util.contracts[token];
			if(!tokenAddress) {
				throw new Error(`Token '${token}' not found (contract address not defined)`);
			}
			let balance_ = await this.util.toGetTokenBalanace_(walletAddress, tokenAddress);
			this.balances_[token] = balance_;
			return balance_;
		}
	}
	async toGetTokenBalance(token) {
		if(token === this.util.tok) {
			return await this.toGetBalance();
		} else {
			let web3 = this.util.web3;
			let walletAddress = this.address;
			let tokenAddress = this.util.contracts[token];
			if(!tokenAddress) {
				throw new Error(`Token '${token}' not found (contract address not defined)`);
			}
			let balance = await this.util.toGetTokenBalanace(walletAddress, tokenAddress);
			this.balances[token] = balance;
			return balance;
		}
	}
	async toTransfer({amount, toAddress}) {
		let web3 = this.util.web3;
		let privateKey = this.key;
		return await this.util.toTransfer({amount, toAddress, privateKey});
	}
	async toTransferToken({amount, token, toAddress}) {
		if(token === this.util.tok) {
			return await this.toTransfer({amount, toAddress});
		} else {
			let web3 = this.util.web3;
			let privateKey = this.key;
			let tokenAddress = this.util.contracts[token];
			if(!tokenAddress) {
				throw new Error(`Token '${token}' not found (contract address not defined)`);
			}
			return await this.util.toTransferToken({amount, tokenAddress, toAddress, privateKey});
		}
	}
	async toSignTransaction(options) {
		let privateKey = this.key;
		let signed = await this.util.web3.eth.accounts.signTransaction(options, privateKey);
		return signed;
	}
	async toSendSignedTransaction(rawTransaction) {
		let receipt = await this.util.web3.eth.sendSignedTransaction(rawTransaction);
		return receipt;
	}
	async toSend(options) {
		let signed = await this.toSignTransaction(options);
		let receipt = await this.toSendSignedTransaction(signed.rawTransaction);
		return receipt;
	}
}
cutil.extend(Account.prototype, {
	defutil: utilEth,
	defScan: Client,
	_address: null,
	key: null,
	_balances: null,
	_balances_: null,
});

export {Account};
