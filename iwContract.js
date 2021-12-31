//	@ghasemkiani/ethereum/iwContract

import {Contract} from "./contract.js";

const iwContract = {
	Contract,
	newContract(...args) {
		let Contract = this.Contract;
		let contract = new Contract(...args);
		if (this.account) {
			contract.account = this.account;
		}
		return contract;
	},
}

export {iwContract};
