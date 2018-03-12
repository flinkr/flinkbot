import * as builder from 'botbuilder';
import * as fb_attachments from "../fb_attachments";
import * as dateExtractor from "../dateExtractor";

let currentClaim = "notSetYet";
function createClaimObject(session: builder.Session): string {
	for (let i = 1; i < 100; i++) {
		if (!session.userData["claim" + i]) {
			session.userData["claim" + i] = {};
			return "claim" + i;
		}
	}
}

export const createLibrary = () => {
	const lib: any = new builder.Library('test');
	lib.dialog("/Schaden melden", [
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
			lib.on("event", (event) => {
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
			session.send(`fertig, wurde eingereicht, here is your claim data ${JSON.stringify(session.userData[currentClaim])}`).endDialog();
		},
	]).triggerAction({ matches: "Schaden melden" });

	lib.dialog("/personenSchaden continued", [
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
			session.send(`fertig, wurde eingereicht, here is your claim data ${JSON.stringify(session.userData[currentClaim])}`).endDialog();
		},
	]);
	lib.dialog("/getDamageOwner", [
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
	lib.dialog("/getRenterContact", [
		(session, args, next) => {
			builder.Prompts.text(session, "Bitte gib die Kontaktdaten deines Vermieters an (Email oder Tel.Nr)?");
		},
		(session, result, next) => {
			session.userData[currentClaim].renterContact = result.response;
			console.log(`DATABASE NEW ENTRY: renterContact: ${session.userData[currentClaim].renterContact}`.cyan);
			session.endDialog();
		},
	]);
	lib.dialog("/getLiabilityContact", [
		(session, args, next) => {
			builder.Prompts.text(session, "Bitte gib die Kontaktdaten der geschädigten Person an (Email oder Tel.Nr)?");
		},
		(session, result, next) => {
			session.userData[currentClaim].liabilityContact = result.response;
			console.log(`DATABASE NEW ENTRY: liabilityContact: ${session.userData[currentClaim].liabilityContact}`.cyan);
			session.endDialog();
		},
	]);
	lib.dialog("/getTheftLocation", [
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
	lib.dialog("/getDamageLocation", [
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

	lib.dialog("/get theftLocation", [
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
	return lib.clone();
};

// Requirements on data to gather: https://docs.google.com/document/d/11pIyiS-iEqyGg6eaqsPiSQPk5rXXyDPoc4Rtx01AkYk/edit
