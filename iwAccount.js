//	@ghasemkiani/ethereum/iwAccount

import {Account} from "./account.js";

const iwAccount = {
	Account,
	newAccount(...args) {
		let Account = this.Account;
		let account = new Account(...args);
		return account;
	},
}

export {iwAccount};
