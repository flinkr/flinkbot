// tslint:disable-next-line:no-var-requires
// const util = require("util");
import * as dotenv from "dotenv";
dotenv.config();

export function routeMessage(session: any, next: any): void {
	switch (session.conversationData.state) {
		case "handedToHuman":
			if (process.env.BotEnv === "develop") {
				console.log("handed to human, but in DEV-mode");
				// dont forward
				next();
			} else {
				// don't do anything
				return;
			}

		default:
			console.log("processed by bot");
			next();
	}
}
