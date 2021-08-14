//	@ghasemkiani/ethereum/token

import {cutil} from "@ghasemkiani/base";
import {Contract} from "./contract.js";
import {itoken} from "./itoken.js";

class Token extends cutil.mixin(Contract, itoken) {}

export {Token};
