import * as builder from 'botbuilder';
import * as fb_attachments from "../attachments/fb_attachments";
import * as dotenv from "dotenv";
/* tslint:enable */
dotenv.config();

export const createLibrary = () => {
	const lib: any = new builder.Library('test');
	lib.dialog("/Login",
	(session, args) => {
		// construct a new message with the current session context
		const msg = new builder.Message(session).sourceEvent(fb_attachments.fbWebviewLogin(process.env.WEBVIEW_URL, session.message.user.id));
		session.send(msg);
		lib.on("event", (event) => {
			if (event.name === "loginSucessful") {
				console.log("Event received!! This is the event" + JSON.stringify(event));
				session.send(`Erfolgreich bei Flink eingeloggt!`).endDialog();
			}
		});
	},
).triggerAction({ matches: "Login" });
	return lib.clone();
};
