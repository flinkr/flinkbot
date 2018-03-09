import * as builder from "botbuilder";
import * as dotenv from "dotenv";
import * as restify from "restify";
import * as util from "util";
import * as flinkapi from "./flinkapi";
import * as dateExtractor from "./dateExtractor";
import * as fb_attachments from "./fb_attachments";
import * as heroCards from "./heroCards";
import * as middleware from "./middleware";
/* tslint:disable */
const azure = require("botbuilder-azure");
const colors = require("colors");
/* tslint:enable */

dotenv.config();
colors.enabled = true;

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
bot.recognizer(new builder.LuisRecognizer(LuisModelUrl)
	// filter low confidence message and route them to default see https://github.com/Microsoft/BotBuilder/issues/3530
	.onFilter((context, result, callback) => {
		if (result.intent !== "None" && result.score < 0.1) {
			callback(null, { score: 0.0, intent: "abc" });
		} else {
			callback(null, result);
		}
	}),
);
server.post("/api/messages", conn.listen());

bot.use({
	botbuilder: (session, next) => {
		middleware.routeMessage(session, next);
	},
});

function getEntity(botbuilder: any, args: any, entity: string): string {
	return botbuilder.EntityRecognizer.findEntity(args.intent.entities.entities);
}

function forwardIfLowConfidence(session: builder.Session, args: any): void {
	console.log("dialog was handed over because confidence is" + args.intent.score);
	session.beginDialog("/handOverToHuman");
}

bot.dialog("/Hallo", [
	(session, args, next) => {
		console.log("hello".green);
		session.send(`Hello, Dialog triggered`);
	},
]).triggerAction({ matches: "Hallo" });

bot.dialog("/Login",
	(session, args) => {
		// construct a new message with the current session context
		const msg = new builder.Message(session).sourceEvent(fb_attachments.fbWebviewLogin(session.message.user.id));
		session.send(msg);
		bot.on("event", (event) => {
			if (event.name === "loginSucessful") {
				console.log("Event received!! This is the event" + JSON.stringify(event));
				session.send(`Erfolgreich bei Flink eingeloggt!`).endDialog();
			}
		});
	},
).triggerAction({ matches: "Login" });

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
		async function getZip(): Promise<any> {
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
		// session.conversationData.testdata = `this is the username in the session ${session.userData.username}`;
		session.send(`Hallo, ${session.userData.username}`);
		session.endDialog();
	},
]).triggerAction({ matches: "setUsername" });

bot.dialog("/", [
	(sess, args, next) => {
		sess.beginDialog("/handOverToHuman");
	},
]);

let currentClaim = "notSetYet";
function createClaimObject(session: builder.Session): string {
	for (let i = 1; i < 100; i++) {
		if (!session.userData["claim" + i]) {
			session.userData["claim" + i] = {};
			return "claim" + i;
		}
	}
}

// Requirements on data to gather: https://docs.google.com/document/d/11pIyiS-iEqyGg6eaqsPiSQPk5rXXyDPoc4Rtx01AkYk/edit

bot.dialog("/Schaden melden", [
	(session, args, next) => {
		// Give the claim a new ID
		currentClaim = createClaimObject(session);
		console.log("This is current claim" + currentClaim);
		builder.Prompts.choice(
			session, "Was ist passiert? \n\n Wurde jemand verletzt,ist etwas kaputt gegangen oder ist dir etwas gestohlen worden?",
			["Etwas kaputt", "Jemand verletzt", "Diebstahl"],
			{
				maxRetries: 3,
				retryPrompt: "Bitte wähle eine der vorgeschlagenen Optionen aus, falls du nicht weiterkommst, schreibe Hilfe",
				listStyle: 3,
			},
		);
	},
	(session, result, next) => {
		console.log("response is: " + result.response.entity);
		switch (result.response.entity) {
			case "Etwas kaputt":
				session.beginDialog("/getDamageOwner");
				next();
				break;
			case "Jemand verletzt":
				session.replaceDialog("/personenSchaden continued");
				next();
				break;
			case "Diebstahl":
				session.beginDialog("/getTheftLocation");
				next();
				break;
			default:
				console.log("........there was an error reached default!");
				session.userData[currentClaim].type = "Diebstahl";
				next();
		}
	},
	(session, result) => {
		builder.Prompts.text(session, "An welchem Datum ist es passiert?");
	},
	(session, result, next) => {
		async function extractDate(): Promise<any> {
			session.userData[currentClaim].date = await dateExtractor.extractDate(result.response);
			console.log("This was saved as claim date in db" + session.userData[currentClaim].date);
		}
		extractDate();
		next();
	},
	(session, result, next) => {
		// construct a new message with the current session context
		const msg = new builder.Message(session).sourceEvent(fb_attachments.fbWebviewClaimObjects(session.message.user.id, currentClaim));
		session.send(msg);
		bot.on("event", (event) => {
			if (event.name === "claimObjectsSuccessful") {
				console.log("Event received!! This is the event" + JSON.stringify(event));
				session.send("Danke fürs eintragen, wenn du später etwas ändern willst, drücke einfach nochmals auf los gehts.!");
				next();
			}
		});
	},
	// Mieterschaden
	(session, result, next) => {
		session.userData[currentClaim].description = result.response;
		if (session.userData[currentClaim].type === "Mieterschaden") {
			builder.Prompts.text(session, "Bitte gib noch die Kontaktdaten des Vermieters (Telefonnummer oder Email) an");
		} else {
			next();
		}
	},
	(session, result, next) => {
		builder.Prompts.text(session, "Bitte gib noch eine kurze Beschreibung, was passiert ist?");
	},
	(session, result) => {
		session.userData[currentClaim].lenderContact = result.response;
		builder.Prompts.text(session, "Wie ist deine IBAN-Kontonummer für die Rückzahlung?");
	},
	(session, result) => {
		session.userData.iban = result.response;
		builder.Prompts.text(session, "Wie ist deine Telefonnummer für allfällige Rückfragen?");
	},
	(session, result) => {
		session.userData.phone = result.response;
		session.send("fertig, wurde eingereicht").endDialog();
	},
]).triggerAction({ matches: "Schaden melden" });

bot.dialog("/personenSchaden continued", [
	(session, args, next) => {
		session.userData[currentClaim].type = "Personenschaden";
		builder.Prompts.text(session, "Bitte gib die Kontaktdaten der beschädigten Person an (Name, Telefon/Email)");
	},
	(session, result, next) => {
		builder.Prompts.text(session, "Bitte gib noch eine kurze Beschreibung, was passiert ist?");
	},
	(session, result) => {
		session.userData[currentClaim].description = "Personenschaden";
		builder.Prompts.text(session, "Wie ist deine Telefonnummer für allfällige Rückfragen?");
	},
	(session, result) => {
		session.userData.phone = result.response;
		session.send("fertig, wurde eingereicht").endDialog();
	},
]);

bot.dialog("/getDamageOwner", [
	(session, args, next) => {
		builder.Prompts.choice(
			session, "Wem gehört das beschädigte Objekt?",
			["Mir", "Meinem Vermieter", "Jemand anderem"],
			{
				maxRetries: 3,
				retryPrompt: "Bitte wähle eine der vorgeschlagenen Optionen aus, falls du nicht weiterkommst, schreibe Hilfe",
				listStyle: 3,
			});
	},
	(session, result, next) => {
		switch (result.response.entity) {
			case "Mir":
				session.userData[currentClaim].type = "Hausratschaden";
				console.log(`DATABASE NEW ENTRY: Type:  ${session.userData[currentClaim].type}`.cyan);
				session.beginDialog("/getDamageLocation");
				break;
			case "Meinem Vermieter":
				session.userData[currentClaim].type = "Mieterschaden";
				console.log(`DATABASE NEW ENTRY: Type:  ${session.userData[currentClaim].type}`.cyan);
				session.beginDialog("/getRenterContact");
				break;
			case "Jemand anderem":
				session.userData[currentClaim].type = "Haftpflicht Sachschaden";
				console.log(`DATABASE NEW ENTRY: Type:  ${session.userData[currentClaim].type}`.cyan);
				session.beginDialog("/getLiabilityContact");
				break;
			default:
				console.log("ERROR: error default was reached, should not happen");
		}
	},
]);

bot.dialog("/getRenterContact", [
	(session, args, next) => {
		builder.Prompts.text(session, "Bitte gib die Kontaktdaten deines Vermieters an (Email oder Tel.Nr)?");
	},
	(session, result, next) => {
		session.userData[currentClaim].renterContact = result.response;
		console.log(`DATABASE NEW ENTRY: renterContact: ${session.userData[currentClaim].renterContact}`.cyan);
		session.endDialog();
	},
]);

bot.dialog("/getLiabilityContact", [
	(session, args, next) => {
		builder.Prompts.text(session, "Bitte gib die Kontaktdaten der geschädigten Person an (Email oder Tel.Nr)?");
	},
	(session, result, next) => {
		session.userData[currentClaim].liabilityContact = result.response;
		console.log(`DATABASE NEW ENTRY: liabilityContact: ${session.userData[currentClaim].liabilityContact}`.cyan);
		session.endDialog();
	},
]);

bot.dialog("/getTheftLocation", [
	(session, args, next) => {
		builder.Prompts.choice(
			session, "Wo ist es passiert?",
			["zuhause", "unterwegs"],
			{
				maxRetries: 3,
				retryPrompt: "Bitte wähle eine der vorgeschlagenen Optionen aus",
				listStyle: 3,
			});
	},
	(session, result, next) => {
		session.endDialog();
	},
]);

bot.dialog("/getDamageLocation", [
	(session, args, next) => {
		builder.Prompts.choice(
			session, "Wo ist es passiert?",
			["zuhause", "unterwegs"],
			{
				maxRetries: 3,
				retryPrompt: "Bitte wähle eine der vorgeschlagenen Optionen aus",
				listStyle: 3,
			});
	},
	(session, result, next) => {
		if (result.response.entity === "zuhause") {
			session.userData[currentClaim].location = "at Home";
			console.log(`DATABASE NEW ENTRY: Type:  ${session.userData[currentClaim].location}`.cyan);
			next();
		} else {
			builder.Prompts.text(session, "Wo ist es passiert (z.B. Zürich, St.Gallen)?");
		}
	},
	(session, result, next) => {
		// if not undefined => not zuhause
		if (result.response) {
			session.userData[currentClaim].location = result.response;
			console.log(`DATABASE NEW ENTRY: Type:  ${session.userData[currentClaim].location}`.cyan);
		}
		session.endDialog();
	},
]);

// console.log(result.response);
// switch (result.response.entity) {
// 	case "Auswärts":
// 		session.userData[currentClaim].auswärts = true;
// 		console.log(`DATABASE NEW ENTRY: type: ${session.userData[currentClaim].litypeabilityContact}`.cyan);

// 	default:
// 		console.log("Not auswärts => continue");
// }
// session.endDialog();

bot.dialog("/get theftLocation", [
	(session, args, next) => {
		builder.Prompts.choice(
			session, "Wo ist es passiert?",
			["Bei mir zuhause", "Auswärts"],
			{
				maxRetries: 3,
				retryPrompt: "Bitte wähle eine der vorgeschlagenen Optionen aus",
				listStyle: 3,
			});
	},
	(session, result, next) => {
		switch (result.response.entity) {
			case "Auswärts":
				session.userData[currentClaim].type = "Diebstahl auswärts";
				console.log(`DATABASE NEW ENTRY: type: ${session.userData[currentClaim].type}`.cyan);
				break;
			default:
				console.log("Response was bei mir zuhause");
		}
		session.endDialog();
	},
]);

bot.dialog("/testDateInput", [
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

bot.dialog("/handOverToHuman", [
	(session, args, next) => {
		session.send("Wir leiten dich gleich an einen Flink-Mitarbeiter weiter!");
		flinkapi.getHumanOnSlack("The bot needs your help on facebook!");
		session.conversationData.state = "handedToHuman";
		session.endDialog();
	},
]).triggerAction({ matches: "handover" });
