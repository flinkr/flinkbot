import * as builder from "botbuilder";
import * as dotenv from "dotenv";
import * as restify from "restify";
import * as util from "util";
import * as flinkapi from "./flinkapi";
import * as middleware from "./middleware";
import * as builder_cognitiveservices from "botbuilder-cognitiveservices";
// import dialogs
import * as testDialog from './testdialog';
import * as reportDamage from './dialogs/reportDamage';
import * as tests from './dialogs/tests';
/* tslint:disable */
const colors: any  = require("colors");
const azure = require("botbuilder-azure");

/* tslint:enable */
dotenv.config();
colors.enabled = true;
// disable forwarding to QnA for Testing
const enableQnA = true;

const documentDbOptions = {
	host: process.env.COSMOS_HOST,
	masterKey: process.env.COSMOS_MASTERKEY,
	database: process.env.COSMOS_DATABASE,
	collection: process.env.COSMOS_COLLECTION,
};
const docDbClient = new azure.DocumentDbClient(documentDbOptions);
const cosmosStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
	console.log(`listening...${server.name}... ${server.url}`);
});
const conn = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD,
});
server.post("/api/messages", conn.listen());
const LuisModelUrl = process.env.LUIS_MODEL_URL;

const bot = new builder.UniversalBot(conn).set("storage", cosmosStorage);
bot.recognizer(new builder.LuisRecognizer(LuisModelUrl)
	// filter low confidence message and route them to default see https://github.com/Microsoft/BotBuilder/issues/3530
	.onFilter((context, result, callback) => {
		console.log(JSON.stringify(result));
		if (enableQnA && result.score < 0.6) {
			// use qnamaker if there is no good result from LUIS
			result.intents[0].intent = "QnAMaker";
			result.intent = "QnAMaker";
			result.score = 1;
		}
		console.log(JSON.stringify(result));
		callback(null, result);
	}),
);

bot.use({
	botbuilder: (session, next) => {
		middleware.routeMessage(session, next);
	},
});

bot.library(testDialog.createLibrary());
bot.library(reportDamage.createLibrary());
bot.library(tests.createLibrary());

const qnarecognizer = new builder_cognitiveservices.QnAMakerRecognizer({
	knowledgeBaseId: '3013f4e6-897a-45fe-a4fb-d26eaf3837fa', // process.env.QnAKnowledgebaseId,
	subscriptionKey: 'bf7c2defac3d4bf3bfcba85c7df27d08', // process.env.QnASubscriptionKey
});
const qnaMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
	recognizers: [qnarecognizer],
	defaultMessage: 'No match! Try changing the query terms!',
	qnaThreshold: 0.3,
});

// Override to also include the knowledgebase question with the answer on confident matches
qnaMakerDialog.respondFromQnAMakerResult = (session, qnaMakerResult) => {
	const result = qnaMakerResult;
	const response = 'Here is the match from QNA-Maker:  \r\n  Q: ' + result.answers[0].questions[0] + '  \r\n A: ' + result.answers[0].answer;
	session.send(response);
};

// Override to not send a response when result not found but instead forward to Flink Team
qnaMakerDialog.invokeAnswer = function(session: builder.Session, recognizeResult: any, threshold: any, noMatchMessage: any): any {
	const qnaMakerResult = recognizeResult;
	session.privateConversationData.qnaFeedbackUserQuestion = session.message.text;
	if (qnaMakerResult.score >= threshold && qnaMakerResult.answers.length > 0) {
		if (this.isConfidentAnswer(qnaMakerResult) || this.qnaMakerTools == null) {
			this.respondFromQnAMakerResult(session, qnaMakerResult);
			this.defaultWaitNextMessage(session, qnaMakerResult);
		} else {
			this.qnaFeedbackStep(session, qnaMakerResult);
		}
	} else {
		session.beginDialog("/handOverToHuman");
		this.defaultWaitNextMessage(session, qnaMakerResult);
	}
};

// function getEntity(botbuilder: any, args: any, entity: string): string {
// 	return botbuilder.EntityRecognizer.findEntity(args.intent.entities.entities);
// }

function forwardIfLowConfidence(session: builder.Session, args: any): void {
	// console.log("dialog was handed over because confidence is" + args.intent.score);
	session.beginDialog("/handOverToHuman");
}

bot.dialog("/", [
	(session, args, next) => {
		console.log("/ reached, will be forwarded to human".green);
		session.send(`/ Dialog triggered, forwarding to human`);
		forwardIfLowConfidence(session, args);
	},
]);

bot.dialog("/qnaMaker", qnaMakerDialog).triggerAction({ matches: "QnAMaker" });

bot.dialog("/handOverToHuman", [
	(session, args, next) => {
		session.send("Wir leiten dich gleich an einen Flink-Mitarbeiter weiter!");
		flinkapi.getHumanOnSlack("The bot needs your help on facebook!");
		session.conversationData.state = "handedToHuman";
		session.endDialog();
	},
]).triggerAction({ matches: "handover" });
