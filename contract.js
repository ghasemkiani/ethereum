//	@ghasemkiani/ethereum/contract

const {cutil} = require("@ghasemkiani/commonbase/cutil");
const {Account} = require("@ghasemkiani/ethereum/account");
const {icontract} = require("@ghasemkiani/ethereum/icontract");

class Contract extends cutil.mixin(Account, icontract) {}

module.exports = {Contract};
