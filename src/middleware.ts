// tslint:disable-next-line:no-var-requires
const util = require("util");
import * as dotenv from "dotenv";

export function logIncomingMessage(session: any, next: any): void {
	console.log("This is log from middleware: " + session.message.text);
	next();
}

export function logOutgoingMessage(session: any, next: any): void {
	console.log("....................This is log from middleware: " + session.message.text);
	next();
}

export function routeMessage(session: any, next: any): void {
	switch (session.conversationData.state) {
		// case "handedToHuman":
		// 	console.log("handed to human");
		// 	// don't do anything
		// 	return;
		default:
			console.log("processed by bot");
			next();
	}
}
