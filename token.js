//	@ghasemkiani/ethereum/token

const {cutil} = require("@ghasemkiani/base/cutil");
const {Contract} = require("@ghasemkiani/ethereum/contract");
const {itoken} = require("@ghasemkiani/ethereum/itoken");

class Token extends cutil.mixin(Contract, itoken) {}

module.exports = {Token};
