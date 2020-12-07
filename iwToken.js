//	@ghasemkiani/ethereum/iwToken

const {Token} = require("@ghasemkiani/ethereum/token");

const iwToken = {
	Token,
	token(...args) {
		let Token = this.Token;
		return new Token(...args);
	},
}

module.exports = {iwToken};
