//	@ghasemkiani/ethereum/iwscan

const iwscan = {
	defScan: null,
	_Scan: null,
	get Scan() {
		return this._Scan || this.defScan;
	},
	set Scan(Scan) {
		this._Scan = Scan;
	},
	get scan() {
		if(!this._scan) {
			let Client = this.Scan;
			this._scan = new Client();
		}
		return this._scan;
	},
	set scan(scan) {
		this._scan = scan;
	},
};

module.exports = {iwscan};
