//	@ghasemkiani/ethereum/iwToken

import {Token} from "./token.js";

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

export {iwToken};
