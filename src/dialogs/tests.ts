import * as builder from 'botbuilder';
import * as dateExtractor from "../dateExtractor";
import * as flinkapi from "../flinkapi";

export const createLibrary = () => {
	const lib = new builder.Library('test');
	lib.dialog("/Hallo", [
		(session, args, next) => {
			console.log('sending hallo back from hallo dialog');
			session.send("Hallo Dialog triggered");
		},
	]).triggerAction({ matches: "Hallo" });

	lib.dialog("/testDateInput", [
		(session, args, next) => {
			builder.Prompts.text(session, "Hi, user, what is your Birthday?");
		},
		(session, result) => {
			async function extractDate(): Promise<any> {
				const date = await dateExtractor.extractDate(result.response);
				session.send(`This is your date: ${JSON.stringify(date)}`);
				session.endDialog();
			}
			extractDate();
		},
	]).triggerAction({ matches: "setBirthday" });

	lib.dialog("/setUsername", [
		(session, args, next) => {
			builder.Prompts.text(session, "Hi, user, what is your Username?");
			// next();
		},
		(session, result) => {
			session.userData.username = result.response;
			// session.conversationData.testdata = `this is the username in the session ${session.userData.username}`;
			session.send(`Hallo, ${session.userData.username}`);
			session.endDialog();
		},
	]).triggerAction({ matches: "setUsername" });

	lib.dialog("/GetZipCode", [
		(session, args, next) => {
			if (!session.userData.authToken) {
				session.beginDialog("/Login");
			}
			if (session.userData.authToken) {
				next();
			}
		},
		(session, args) => {
			async function getZip(): Promise<any> {
				const zip = await flinkapi.getZipCode(session.userData.authToken);
				session.send(`Dies ist deine Postleitzahl: ${zip}`);
				session.endDialog();
			}
			getZip();
		},
	]).triggerAction({ matches: "Meine PLZ" });
	return lib.clone();
};
