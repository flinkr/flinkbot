import * as builder from "botbuilder";
import * as dotenv from "dotenv";
import * as restify from "restify";
import * as flinkapi from "./flinkapi";

dotenv.config();

function logIntents(args: any): void {
	console.log(args);
	console.log(args.intent.intent);
	console.log(args.intent.entities);
}

const server = restify.createServer();
server.listen(process.env.port|| process.env.PORT || 3978, () => {
	console.log(`listening...${server.name}... ${server.url}`);
});

const conn = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD,
});

const LuisModelUrl = 'https://westeurope.api.cognitive.microsoft.com/luis/v2.0/apps/455bc78d-5193-448f-a2cc-bc02c55732df?subscription-key=de1144d124ba42719a63f71d49e499e3&verbose=true&timezoneOffset=0&q='
const bot = new builder.UniversalBot(conn);
bot.recognizer(new builder.LuisRecognizer(LuisModelUrl));
// route incoming posts to the handler conn.listen
server.post("/api/messages", conn.listen());

bot.dialog("/FAQAddress", (sess, args) => {
	sess.send(`The address is Bahnhofstrasse 5!`);
}).triggerAction({
	matches: "/FAQ: Adresse von Flink",
});

// intents.onDefault([
// (sess, args, next) => {
// 		sess.userData.arrival = undefined;
// 		sess.userData.departure = undefined;
// 		if (!sess.userData.name) {
// 			sess.beginDialog("/profile");
// 		} else {
// 			next();
// 		}
// 	},
// 	(sess, result) => {
// 		sess.send(`Hello ${sess.userData.name}, how can I help you?`)
// 	},
// ]);

// //register intents to bot, trigger it first
// var intents = new builder.IntentDialog({ recognizers: [recognizer] })
// bot.dialog("/", intents);

bot.dialog("/", [
	(sess, args, next) => {
		builder.Prompts.text(sess, "Hi, how can i help you?");
	},
	(sess, result) => {
		sess.userData.name = result.response;
		sess.endDialog();
	},
]);
