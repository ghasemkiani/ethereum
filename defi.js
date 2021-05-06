//	@ghasemkiani/ethereum/defi

const {cutil} = require("@ghasemkiani/base/cutil");
const {Obj: Base} = require("@ghasemkiani/base/obj");
const {iwutil} = require("@ghasemkiani/ethereum/iwutil");
const {util: utilEth} = require("@ghasemkiani/ethereum/util");
const {Client} = require("@ghasemkiani/etherscan-api/client");
const {iwscan} = require("@ghasemkiani/ethereum/iwscan");
const {iwToken: iwTokenEth} = require("@ghasemkiani/ethereum/iwToken");

class DeFi extends cutil.mixin(Base, iwutil, iwscan, iwTokenEth) {
	
}
cutil.extend(DeFi.prototype, {
	defutil: utilEth,
	defScan: Client,
	account: null,
});

module.exports = {DeFi};
