export function logIncomingMessage(session: any, next: any): void {
	console.log("This is log from middleware: " + session.message.text);
	next();
}

export function logOutgoingMessage(session: any, next: any): void {
	console.log("This is log from middleware: " + session.message.text);
	next();
}

export function routeMessage(session: any, next: any): void {
	switch (session.conversationData.state) {
		// case "Bot":
		// 	// send to bot
		// 	next();
		case "handedToHuman":
			// session.send("ich leite dich an jemanden vom Flink Team weiter");
			// don't do anything
			return;
		default:
			// session.send("ich leite dich an jemanden vom Flink Team weiter");
			// don't do anything
			next();
	}
}
