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

const LuisModelUrl = process.env.LUIS_MODEL_URL;
const bot = new builder.UniversalBot(conn);
bot.recognizer(new builder.LuisRecognizer(LuisModelUrl));
server.post("/api/messages", conn.listen());

bot.dialog("/FAQAddress",
	(session, args) => {
		logIntents(args);
		session.send(`The address is Bahnhofstrasse 5!`)
		session.endDialog();
	}
).triggerAction({
	matches: "FAQ: Adresse von Flink",
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