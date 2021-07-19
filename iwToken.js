//	@ghasemkiani/ethereum/iwToken

const {Token} = require("@ghasemkiani/ethereum/token");

const iwToken = {
	Token,
	token(...args) {
		let Token = this.Token;
		let token = new Token(...args);
		if (this.account) {
			token.account = this.account;
		}
		return token;
	},
}

module.exports = {iwToken};
