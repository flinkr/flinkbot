import * as builder from "botbuilder";
// import * as azure from "botbuilder-azure";
import * as dotenv from "dotenv";
import * as restify from "restify";
import * as util from "util";
import * as flinkapi from "./flinkapi";
import facebookLoginWebview from "./fb_attachments";

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
const bot = new builder.UniversalBot(conn).set("storage", cosmosStorage);
bot.recognizer(new builder.LuisRecognizer(LuisModelUrl));
server.post("/api/messages", conn.listen());

function getEntity(botbuilder: any, args: any, entity: string): string {
	return botbuilder.EntityRecognizer.findEntity(args.intent.entities.entities);
}

bot.dialog("/Login", (session) => {
	// construct a new message with the current session context
	const msg = new builder.Message(session).sourceEvent({
		facebook: {
			// format according to channel's requirements
			// https://github.com/Microsoft/BotBuilder-Samples/blob/master/Node/blog-customChannelData/app.js
			// https://developers.facebook.com/docs/messenger-platform/reference/buttons/url
			attachment: {
				type: "template",
				payload: {
					template_type: "generic",
					elements: [
						{
							title: "Bitte bei Flink einloggen",
							// subtitle: "This is subtitle",
							buttons: [
								{
									type: "web_url",
									url: "https://www.goflink.ch",
									title: "Login",
									webview_height_ratio: "compact",
									"messenger_extensions": true,
								},
							],
						},
					],
				},
			}, // end of attachment
		},
	});

	session.send(msg).endDialog();
}).triggerAction({ matches: "Login" });

// bot.dialog("/Login", (session) => {
// 	const msg = new builder.Message(session);
// 	msg.attachmentLayout(builder.AttachmentLayout.carousel);
// 	msg.attachments([
// 		new builder.SigninCard(session)
// 			.text("Bitte logge dich hier ein")
// 			.button(
// 				"Login", "https://www.goflink.ch",
// 			),
// 	]);
// 	session.send(msg).endDialog();
// }).triggerAction({ matches: "Login" });

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
