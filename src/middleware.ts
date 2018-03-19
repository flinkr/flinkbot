// tslint:disable-next-line:no-var-requires
// const util = require("util");
import * as dotenv from "dotenv";

export function routeMessage(session: any, next: any): void {
	switch (session.conversationData.state) {
		case "handedToHuman":
			console.log("handed to human");
			// don't do anything
			return;
		default:
			console.log("processed by bot");
			next();
	}
}
