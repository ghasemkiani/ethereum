//	@ghasemkiani/ethereum/defi

const {cutil} = require("@ghasemkiani/commonbase/cutil");
const {Base} = require("@ghasemkiani/commonbase/base");
const {iwutil} = require("@ghasemkiani/ethereum/iwutil");
const {util: utilEth} = require("@ghasemkiani/ethereum/util");
const {Client} = require("@ghasemkiani/etherscan-api/client");
const {iwscan} = require("@ghasemkiani/ethereum/iwscan");

class DeFi extends cutil.mixin(Base, iwutil, iwscan) {
	
}
cutil.extend(DeFi.prototype, {
	defutil: utilEth,
	defScan: Client,
	account: null,
});

module.exports = {DeFi};
