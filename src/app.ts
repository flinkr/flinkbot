import * as builder from "botbuilder";
// import * as azure from "botbuilder-azure";
import * as dotenv from "dotenv";
import * as restify from "restify";
import * as flinkapi from "./flinkapi";

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
const bot = new builder.UniversalBot(conn).set("storage", cosmosStorage);
bot.recognizer(new builder.LuisRecognizer(LuisModelUrl));
server.post("/api/messages", conn.listen());

function getEntity(botbuilder: any, args: any, entity: string): string {
	return botbuilder.EntityRecognizer.findEntity(args.intent.entities.entities);
}

bot.dialog("/Login", (session) => {
	const msg = new builder.Message(session);
	msg.attachmentLayout(builder.AttachmentLayout.carousel);
	msg.attachments([
		new builder.SigninCard(session)
			.text("Bitte logge dich hier ein")
			.button(
				"Login", "http//:www.goflink.ch",
			),
		// new builder.HeroCard(session)
		// 	.title("Classic White T-Shirt")
		// 	.subtitle("100% Soft and Luxurious Cotton")
		// 	.text("Price is $25 and carried in sizes (S, M, L, and XL)")
		// 	.images([builder.CardImage.create(session, "http://petersapparel.parseapp.com/img/whiteshirt.png")])
		// 	.buttons([
		// 		builder.CardAction.imBack(session, "buy classic white t-shirt", "Buy"),
		// 	]),
		// new builder.HeroCard(session)
		// 	.title("Classic Gray T-Shirt")
		// 	.subtitle("100% Soft and Luxurious Cotton")
		// 	.text("Price is $25 and carried in sizes (S, M, L, and XL)")
		// 	.images([builder.CardImage.create(session, "http://petersapparel.parseapp.com/img/grayshirt.png")])
		// 	.buttons([
		// 		builder.CardAction.imBack(session, "buy classic gray t-shirt", "Buy"),
		// 	]),
	]);
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
	(sess, args, next) => {
		builder.Prompts.text(sess, "Hi, user, what is your Username?");
		// next();
	},
	(sess, result) => {
		sess.userData.username = result.response;
		sess.userData.name2 = "testname";
		sess.conversationData.testdata = "sessiondata";
		sess.send(`Hallo, ${sess.userData.name2}`);
		sess.endDialog();
	},
]).triggerAction({
	matches: "setUsername",
});

// bot.dialog("/login", [
// 	(sess, args, next) => {
// 		builder.Prompts.text(sess, "Hi, user, what is your authToken?");
// 	},
// 	(sess, result) => {
// 		sess.userData.authToken = result.response;
// 		sess.endDialog();
// 	},
// ]);

bot.dialog("/", [
	(sess, args, next) => {
		builder.Prompts.text(sess, "Hi, how can i help you?");
	},
	(sess, result) => {
		sess.userData.name = result.response;
		sess.endDialog();
	},
]);
