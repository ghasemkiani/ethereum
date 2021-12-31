//	@ghasemkiani/ethereum/defi

import {cutil} from "@ghasemkiani/base";
import {Obj} from "@ghasemkiani/base";
import {Client} from "@ghasemkiani/etherscan-api";
import {iwutil} from "./iwutil.js";
import {util as utilEth} from "./util.js";
import {iwscan} from "./iwscan.js";
import {iwAccount as iwAccountEth} from "./iwAccount.js";
import {iwContract as iwContractEth} from "./iwContract.js";
import {iwToken as iwTokenEth} from "./iwToken.js";

class DeFi extends cutil.mixin(Obj, iwutil, iwscan, iwAccountEth, iwContractEth, iwTokenEth) {
	
}
cutil.extend(DeFi.prototype, {
	defutil: utilEth,
	defScan: Client,
	account: null,
});

export {DeFi};
