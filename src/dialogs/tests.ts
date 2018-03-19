import * as builder from 'botbuilder';
import * as dateExtractor from "../dateExtractor";
import * as flinkapi from "../flinkapi";
import * as ibanExtractor from "../utils/ibanExtractor";
/* tslint:disable */
const colors: any = require("colors");
/* tslint:enable */
colors.enabled = true;

export const createLibrary = () => {
	const lib = new builder.Library('test');
	lib.dialog("/Hallo", [
		(session, args, next) => {
			console.log('sending hallo back from hallo dialog'.blue);
			session.send("Hallo Dialog triggered");
		},
	]).triggerAction({ matches: "Hallo" });

	lib.dialog("/Test Dialog", [
		(session, args, next) => {
			console.log('test triggered'.cyan);
			session.send("TEST triggered");
			builder.Prompts.text(session, "Please say sth..?");
		},
		(session, result) => {
			session.send(`you said ${result.response}`);
		},
	]).triggerAction({ matches: "test dialog" });

	// lib.dialog("/iban", [
	// 	(session, args, next) => {
	// 		console.log('testiban triggered');
	// 		if (args && args.reprompt) {
	// 			builder.Prompts.text(session, "Iban ist ungültig, bitte nochmals eingeben. (nur schweizer IBAN)");
	// 		} else {
	// 			builder.Prompts.text(session, "Hallo, wie ist deine Iban?");
	// 		}
	// 	},
	// 	(session, result) => {
	// 		const iban = ibanExtractor.extractIban(result.response);
	// 		if (iban === "false") {
	// 			session.send(``);
	// 			session.replaceDialog("/iban", { reprompt: true });
	// 		} else {
	// 			session.send(`This is the result: ${iban}`);
	// 		}
	// 	},
	// ]).triggerAction({ matches: "iban" });
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

// bot.dialog('phonePrompt', [
//     function (session, args) {
//         if (args && args.reprompt) {
//             builder.Prompts.text(session, "Enter the number using a format of either: '(555) 123-4567' or '555-123-4567' or '5551234567'")
//         } else {
//             builder.Prompts.text(session, "What's your phone number?");
//         }
//     },
//     function (session, results) {
//         var matched = results.response.match(/\d+/g);
//         var number = matched ? matched.join('') : '';
//         if (number.length == 10 || number.length == 11) {
//             session.userData.phoneNumber = number; // Save the number.
//             session.endDialogWithResult({ response: number });
//         } else {
//             // Repeat the dialog
//             session.replaceDialog('phonePrompt', { reprompt: true });
//         }
//     }
// ]);
