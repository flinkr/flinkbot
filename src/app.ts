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

// bot.dialog("/getId", (session) => {
// 	// construct a new message with the current session context
// 	console.log("This is the userdata: " + JSON.stringify(session.userData));
// 	console.log("This is the username: " + session.userData.username);
// 	let userId = session.message.user.id;
// 	session.send(`Your Id is: ${userId}`);
// }).triggerAction({ matches: "print id" });

bot.dialog("/Login", (session) => {
	// construct a new message with the current session context
	const msg = new builder.Message(session).sourceEvent(fb_attachments.fbWebviewLogin(session.message.user.id));

	session.send(msg).endDialog();
}).triggerAction({ matches: "Login" });

bot.dialog("/FAQAddress",
	(session, args) => {
		// logIntents(args);
		session.send(`The address is Bahnhofstrasse 5!`);
		session.endDialog();
	},
).triggerAction({
	matches: "FAQ: Adresse von Flink",
});

bot.dialog("/Hallo",
	(session, args) => {
		// logIntents(args);
		session.send(`Hallo, wie kann ich helfen?`);
		session.endDialog();
	},
).triggerAction({
	matches: "Hallo",
});

bot.dialog("/GetZipCode",
	(session, args) => {
		if (!session.userData.authToken) {
			session.beginDialog("/Login");
		} else {
			getZip();
		}
		async function getZip() {
			const zip = await flinkapi.getZipCode(session.userData.authToken);
			session.send(`Dies ist deine Postleitzahl: ${zip}`);
			session.endDialog();
		}

	},
).triggerAction({
	matches: "Meine PLZ",
});

bot.dialog("/CostsOfInsurance",
	(session, args) => {
		console.log("This is 3 log: " + JSON.stringify(args.intent.entities[0].type));
		// tslint:disable-next-line:max-line-length
		// console.log ("those are the entities found: " + builder.EntityRecognizer.findEntity(args.intent.entities[0], "Haftpflicht"));
		session.send(`Deine Hausrat kostet 5 Franken`);
		session.endDialog();
	},
).triggerAction({
	matches: "Was kostet meine Versicherung?",

});

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
]).triggerAction({
	matches: "setUsername",
});


bot.dialog("/", [
	(sess, args, next) => {
		builder.Prompts.text(sess, "Hi, how can i help you?");
	},
	(sess, result) => {
		sess.userData.name = result.response;
		sess.endDialog();
	},
]);


bot.dialog("/Schaden melden", [
	(session, args, next) => {
		// prompt for search option
		builder.Prompts.choice(
			session, 'Um welche Art von Schaden handelt es sich?',
			["Sachen von jemand anderem beschädigt", "Schaden an Mietwohnung", "Ich habe jemanden verletzt"],
			{
				maxRetries: 3,
				retryPrompt: 'Not a valid option',
			});
			
	},
	(session, result) => {
		session.userData.damage.type = result;
		// prompt for search option
		builder.Prompts.text(
			session, 'An welchem Datum ist es passiert')
	},
	(session, result) => {
		var time = builder.EntityRecognizer.findEntity(result.entities, 'builtin.datetime');
		// prompt for search option
		builder.Prompts.text(
			session, 'An welchem Datum ist es passiert')
	},			
	(session, result) => {
		var msg = new builder.Message(session)
			.text("Um welche Art von Schaden handelt es sich?")
			.suggestedActions(
				builder.SuggestedActions.create(session, [
					builder.CardAction.imBack(session, "Ich habe die Sachen von jemand anderem beschädigt", "Sachen von jemand anderem beschädigt"),
					builder.CardAction.imBack(session, "Ich habe etwas in der Mietwohnung kaputtgemacht", "Schaden an Mietwohnung"),
					builder.CardAction.imBack(session, "Mir wurde etwas gestohlen", "Diebstahl"),
					builder.CardAction.imBack(session, "Ich habe jemanden verletzt", "Ich habe jemanden verletzt"),
					builder.CardAction.imBack(session, "Etwas von mir wurde beschädigt", "Etwas von mir ist Beschädigt")
				]
				));
		session.send(msg);

		
	},
	(session, result) => {
		session.send(`Ok, deine wahl war, ${result}`);
		session.endDialog();
	},
]).triggerAction({
	matches: "Schaden melden",
});

// If you want to match manual witout luis
// bot.recognizer(new builder.RegExpRecognizer( "CancelIntent", { en_us: /^(cancel|nevermind)/i, ja_jp: /^(キャンセル)/ }));

bot.dialog("/testDateInput", [
	(session, args, next) => {
		builder.Prompts.text(session, "Hi, user, what is your Birthday?");
		// next();
	},
	(session, result) => {
		builder.LuisRecognizer.recognize(session.message.text, EnglishLuisModelUrl, (err, intents, entities) => {
			console.log(`This is your entity, ${JSON.stringify(entities)}`);
			let entity = entities;
			console.log(entities[0].resolution.values[0].value)
		})
		
		session.endDialog();
	}
]).triggerAction({
	matches: "setBirthday",
});
