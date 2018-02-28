import * as builder from "botbuilder";
// import * as azure from "botbuilder-azure";
import * as dotenv from "dotenv";
import * as restify from "restify";
import * as util from "util";
import * as flinkapi from "./flinkapi";
import * as fb_attachments from "./fb_attachments";
// tslint:disable-next-line:no-var-requires
const azure = require("botbuilder-azure");
dotenv.config();

const documentDbOptions = {
	host: process.env.COSMOS_HOST,
	masterKey: process.env.COSMOS_MASTERKEY,
	database: process.env.COSMOS_DATABASE,
	collection: process.env.COSMOS_COLLECTION,
};
const docDbClient = new azure.DocumentDbClient(documentDbOptions);
const cosmosStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);

function logIntents(args: any): void {
	console.log(args);
	console.log(args.intent.intent);
	console.log(args.intent.entities);
}
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
	console.log(`listening...${server.name}... ${server.url}`);
});
const conn = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD,
});
const LuisModelUrl = process.env.LUIS_MODEL_URL;
const EnglishLuisModelUrl = process.env.LUIS_MODEL_URL_ENGLISH_ENTITIES;
const bot = new builder.UniversalBot(conn).set("storage", cosmosStorage);
bot.recognizer(new builder.LuisRecognizer(LuisModelUrl));
server.post("/api/messages", conn.listen());

function getEntity(botbuilder: any, args: any, entity: string): string {
	return botbuilder.EntityRecognizer.findEntity(args.intent.entities.entities);
}



bot.dialog("/Hallo",
	(session, args) => {
		// bot.on("event", function (event) {
		// 	console.log("Event received!! This is the event"+JSON.stringify(event));
		// 	session.send(`Yo, ich habe auf deine Nachricht reagiert`);
		// })
		// logIntents(args);
		console.log("hello was matched");
		session.send(`Hallo, wie kann ich helfen?`);
		session.endDialog();
	},
).triggerAction({ matches: "Hallo" });

bot.dialog("/Login",
	(session, args) => {
		// construct a new message with the current session context
		const msg = new builder.Message(session).sourceEvent(fb_attachments.fbWebviewLogin(session.message.user.id));
		session.send(msg);
		bot.on("event", function (event) {
			console.log("Event received!! This is the event" + JSON.stringify(event));
			session.send(`Erfolgreich bei Flink eingeloggt!`).endDialog();
		})
	}
).triggerAction({ matches: "Login" });


// bot.dialog("/GetZipCode", [
// 	(session, args, next) => {
// 		builder.Prompts.text(session, "Hi, user, what is your Username?");
// 		// next();
// 	},
// 	(session, result) => {
// 		session.userData.username = result.response;
// 		session.userData.name2 = "testname";
// 		session.conversationData.testdata = `this is the username in the session ${session.userData.username}`;
// 		session.send(`Hallo, ${session.userData.username}`);
// 		session.endDialog();
// 	},
// ]).triggerAction({ matches: "setUsername" });


bot.dialog("/GetZipCode", [
	(session, args, next) => {
		if (!session.userData.authToken) {
			session.beginDialog("/Login");
		}
		if (session.userData.authToken) {
			next();
		}
	},
	(session, args) => {
		async function getZip() {
			const zip = await flinkapi.getZipCode(session.userData.authToken);
			session.send(`Dies ist deine Postleitzahl: ${zip}`);
			session.endDialog();
		}
		getZip();

	},
]).triggerAction({ matches: "Meine PLZ" });

bot.dialog("/CostsOfInsurance",
	(session, args) => {
		console.log("This is 3 log: " + JSON.stringify(args.intent.entities[0].type));
		// tslint:disable-next-line:max-line-length
		// console.log ("those are the entities found: " + builder.EntityRecognizer.findEntity(args.intent.entities[0], "Haftpflicht"));
		session.send(`Deine Hausrat kostet 5 Franken`);
		session.endDialog();
	},
).triggerAction({ matches: "Was kostet meine Versicherung?" });

bot.dialog("/setUsername", [
	(session, args, next) => {
		builder.Prompts.text(session, "Hi, user, what is your Username?");
		// next();
	},
	(session, result) => {
		session.userData.username = result.response;
		session.userData.name2 = "testname";
		session.conversationData.testdata = `this is the username in the session ${session.userData.username}`;
		session.send(`Hallo, ${session.userData.username}`);
		session.endDialog();
	},
]).triggerAction({ matches: "setUsername" });

bot.dialog("/", [
	(sess, args, next) => {
		builder.Prompts.text(sess, "Hi, how can i help you?");
	},
	(sess, result) => {
		sess.userData.name = result.response;
		sess.endDialog();
	},
]);

// Requirements on data to gather: https://docs.google.com/document/d/11pIyiS-iEqyGg6eaqsPiSQPk5rXXyDPoc4Rtx01AkYk/edit
bot.dialog("/Schaden melden", [
	(session, args, next) => {
		// prompt for search option
		builder.Prompts.choice(
			session, 'Um welche Art von Schaden handelt es sich?',
			["Sachen von jemand anderem beschädigt", "Schaden an Mietwohnung", "Ich habe jemanden verletzt"],
			{
				maxRetries: 3,
				retryPrompt: 'Not a valid option',
				listStyle: 3
			});
	},
	(session, result) => {
		// console.log(`this is the damage type: ${result.response}`)
		session.userData.damage_type = result.response.entity;
		// prompt for search option
		builder.Prompts.text(session, 'An welchem Datum ist es passiert?');
	},
	(session, result, next) => {
		builder.LuisRecognizer.recognize(session.message.text, EnglishLuisModelUrl, (err, intents, entities) => {
			console.log(`This is your entity, ${JSON.stringify(entities)}`);
			let entity = entities;
			console.log((entities as any)[0].resolution.values[0].value);
			session.userData.damage_date = (entities as any)[0].resolution.values[0].value;
		})
		session.send(`Ok, am ${session.userData.damage_date} ist ein schaden vom typ ${session.userData.damage_type} passiert. Dies ist die nächste Frage?`);
		next();// builder.Prompts.text(session, `Ok, am ${session.userData.damage_date} ist ein schaden vom typ ${session.userData.damage_type} passiert. Dies ist die nächste Frage?`);
	},
	(session, result, next) => {
		// construct a new message with the current session context
		const msg = new builder.Message(session).sourceEvent(fb_attachments.fbWebviewClaimObjects(session.message.user.id));
		session.send(msg);
		bot.on("event", function (event) {
			console.log("Event received!! This is the event" + JSON.stringify(event));
			builder.Prompts.text(session, 'Bitte gib noch eine kurze Beschreibung, was passiert ist?');
		});
	},
	// Mieterschaden
	(session, result, next) => {
		if (session.userData.damage_type == "Mieterschaden") {
			builder.Prompts.text(session, 'Bitte gib noch die Kontaktdaten des Vermieters an');
		} else {
			next();
		}
	},

	(session, result) => {
		session.userData.damage_lenderContact = result.response.entity;
		builder.Prompts.text(session, 'Wie ist deine IBAN-Kontonummer für die Rückzahlung?');
	},
	(session, result) => {
		session.userData.iban = result.response.entity;
		builder.Prompts.text(session, 'Wie ist deine IBAN für die Rückzahlung?');
	},
	(session, result) => {
		session.userData.damage_type = result.response.entity;
		builder.Prompts.text(session, 'Wie ist deine Telefonnummer für allfällige Rückfragen?');
	},


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
	(session, result) => {
		session.send(`Ok, deine wahl war, ${result}`);
		session.endDialog();
	},
]).triggerAction({ matches: "Schaden melden" });

bot.dialog("/testDateInput", [
	(session, args, next) => {
		builder.Prompts.text(session, "Hi, user, what is your Birthday?");
		// next();
	},
	(session, result) => {
		builder.LuisRecognizer.recognize(session.message.text, EnglishLuisModelUrl, (err, intents, entities) => {
			console.log(`This is your entity, ${JSON.stringify(entities)}`);
			let entity = entities;
			console.log((entities as any)[0].resolution.values[0].value)
		})
		session.endDialog();
	}
]).triggerAction({ matches: "setBirthday" });


let testvar: boolean = true;
bot.dialog('/test', [
	(session, args, next) => {
		session.send("please make event to continue");
		bot.on("event", function (event) {
			console.log("Event received!! This is the event" + JSON.stringify(event));
			session.send(`Erfolgreich bei Flink eingeloggt!`);
			next();
		});
	},
	(session, args) => {
		session.send("OK the dialog can now begin because we have the login token").endDialog();
	},
]).triggerAction({ matches: "testDialog" });

bot.dialog('/help', function (session, args, next) {
	session.send("2");
	bot.on("event", function (event) {
		console.log("Event received!! This is the event" + JSON.stringify(event));
		session.send(`Erfolgreich bei Flink eingeloggt!`).endDialog();
	})
}).triggerAction({ matches: "testRoute" });



bot.beginDialogAction('login', '/login', { matches: /^login/i });
bot.dialog('/login', (session) => {
	//login
	console.log("handling login...");
	session.endDialog();
});




bot.dialog('/getUserData', [
(session, args, next) => {
	session.beginDialog("/Login1");
},
(session, args, next) => {
	session.send(`This is your token ${session.userData.token}, so getUserData could be handled now`).endDialog();
},
]).triggerAction({ matches: "getUserData" });

bot.dialog('/Login1', (session, args, next) => {
	session.send("You need to login for this action");
	// [..open facebook webview so user can login] and wait for event
	bot.on("event", function (event) {
		session.userData.token = "exampletoken";
		session.send("2:Successfully logged in");
		session.endDialog();
	})
})

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