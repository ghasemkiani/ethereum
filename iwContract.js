//	@ghasemkiani/ethereum/iwContract

import {Contract} from "./contract.js";

const iwContract = {
	Contract,
	contract(...args) {
		let Contract = this.Contract;
		let contract = new Contract(...args);
		if (this.account) {
			token.account = this.account;
		}
		return contract;
	},
}

export {iwContract};
