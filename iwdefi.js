//	@ghasemkiani/ethereum/iwdefi

const iwdefi = {
	defi: null,
	get account() {
		return this.defi ? this.defi.account : null;
	},
	set account(account) {
		if(this.defi) {
			this.defi.account = account;
		}
	},
};

module.exports = {iwdefi};
