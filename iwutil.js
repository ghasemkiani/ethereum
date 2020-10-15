//	@ghasemkiani/ethereum/iwutil

const iwutil = {
	defutil: null,
	_util: null,
	get util() {
		if(!this._util) {
			this._util = this.defutil;
		}
		return this._util;
	},
	set util(util) {
		this._util = util;
	},
};

module.exports = {iwutil};
