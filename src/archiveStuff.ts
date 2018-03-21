/* tslint:disable */
// import * as builder from 'botbuilder';

// export const createLibrary = () => {
// 	const lib = new builder.Library('test');
// 	lib.dialog("/Test", [
// 		(session, args, next) => {
// 			console.log("test".green);
// 			session.send(`Test Dialog triggered`);
// 		},
// 	]).triggerAction({ matches: "test" });
// 	return lib.clone();
// };

// const testvar: boolean = true;
// bot.dialog("/test", [
// 	(session, args, next) => {
// 		session.send("please make event to continue");
// 		bot.on("event", (event) => {
// 			console.log("Event received!! This is the event" + JSON.stringify(event));
// 			session.send(`Erfolgreich bei Flink eingeloggt!`);
// 			next();
// 		});
// 	},
// 	(session, args) => {
// 		session.send("OK the dialog can now begin because we have the login token").endDialog();
// 	},
// ]).triggerAction({ matches: "testDialog" });

// bot.dialog("/help", (session, args, next) => {
// 	session.send("2");
// 	bot.on("event", (event) => {
// 		console.log("Event received!! This is the event" + JSON.stringify(event));
// 		session.send(`Erfolgreich bei Flink eingeloggt!`).endDialog();
// 	});
// }).triggerAction({ matches: "testRoute" });

// bot.dialog("/getUserData", [
// 	(session, args, next) => {
// 		session.beginDialog("/Login1");
// 	},
// 	(session, args, next) => {
// 		session.send(`This is your token ${session.userData.token}, so getUserData could be handled now`).endDialog();
// 	},
// ]).triggerAction({ matches: "getUserData" });

// bot.dialog("/Login1", (session, args, next) => {
// 	session.send("You need to login for this action");
// 	// [..open facebook webview so user can login] and wait for event
// 	bot.on("event", (event) => {
// 		session.userData.token = "exampletoken";
// 		session.send("2:Successfully logged in");
// 		session.endDialog();
// 	});
// });

// bot.dialog('/login1', (session)=>{
//     //login
//     console.log("handling login...");
//     session.endDialog();
// });

// bot.dialog('checkshoppingcart', [
//     (session)=>{
//         session.beginDialog('/login1');
//     },
//     (session, results)=>{
// 		//second step
// 		session.send("this is the second")
//     }
// ]).triggerAction({matches:/^show shopping cart/i});

// (session, result) => {
	// 	var msg = new builder.Message(session)
	// 		.text("Um welche Art von Schaden handelt es sich?")
	// 		.suggestedActions(
	// 			builder.SuggestedActions.create(session, [
	// 				builder.CardAction.imBack(session, "Ich habe die Sachen von jemand anderem beschädigt", "Sachen von jemand anderem beschädigt"),
	// 				builder.CardAction.imBack(session, "Ich habe etwas in der Mietwohnung kaputtgemacht", "Schaden an Mietwohnung"),
	// 				builder.CardAction.imBack(session, "Mir wurde etwas gestohlen", "Diebstahl"),
	// 				builder.CardAction.imBack(session, "Ich habe jemanden verletzt", "Ich habe jemanden verletzt"),
	// 				builder.CardAction.imBack(session, "Etwas von mir wurde beschädigt", "Etwas von mir ist Beschädigt")
	// 			]
	// 			));
	// 	session.send(msg);

	// },
	// (session, result) => {
	// 	session.send(`Ok, deine wahl war, ${result}`);
	// 	session.endDialog();
	// }

	// https://stackoverflow.com/questions/44407242/multiple-buttons-in-herocard
	// bot.dialog("/showCards", [
	// 	(session) => {
	// 		const msg = new Message(session)
	// 			.textFormat(TextFormat.xml)
	// 			.attachmentLayout(AttachmentLayout.carousel)
	// 			.attachments([{
	// 				title: "title",
	// 				url: "https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png"
	// 			}].map(obj =>
	// 				new HeroCard(session)
	// 					.title(obj.title)
	// 					.images([
	// 						CardImage.create(session, obj.url)
	// 							.tap(CardAction.showImage(session, obj.url)),
	// 					])
	// 					.buttons([
	// 						CardAction.openUrl(session, obj.url),
	// 						CardAction.imBack(session, `click`, "Click"),
	// 						CardAction.imBack(session, `clack`, "Clack")
	// 					])
	// 			));
	// 		Prompts.choice(session, msg, ["click", "clack"]);
	// 	},
	// 	(session, results) => {
	// 		// todo use results.response.entity
	// 	}
	// ])
	// bot.dialog("/", [
// 	(sess, args, next) => {
// 		sess.beginDialog("/handOverToHuman");
// 	},
// ]);

// console.log(result.response);
// switch (result.response.entity) {
// 	case "Auswärts":
// 		session.userData[currentClaim].auswärts = true;
// 		console.log(`DATABASE NEW ENTRY: type: ${session.userData[currentClaim].litypeabilityContact}`.cyan);

// 	default:
// 		console.log("Not auswärts => continue");
// }
// session.endDialog();

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