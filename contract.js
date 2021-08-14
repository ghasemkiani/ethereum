//	@ghasemkiani/ethereum/contract

import {cutil} from "@ghasemkiani/base";
import {Account} from "./account.js";
import {icontract} from "./icontract.js";

class Contract extends cutil.mixin(Account, icontract) {}

export {Contract};
