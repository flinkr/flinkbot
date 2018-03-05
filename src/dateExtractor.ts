import * as dotenv from "dotenv";
import * as builder from "botbuilder";
dotenv.config();
const EnglishLuisModelUrl = process.env.LUIS_MODEL_URL_ENGLISH_ENTITIES;

export async function extractDate(userInput: string): Promise<any> {
	try {
		console.log("...........userinput: " + userInput);
		let date: string;
		const sanitizedDateArray = sanitizeDatesForLuis(userInput);
		const returnedFromLuis = await getDateFromLuisAsync(sanitizedDateArray);
		console.log(".......Returned from luis: " + JSON.stringify(returnedFromLuis));
		date = (returnedFromLuis as any)[0].resolution.values[0].value;
		console.log(".......This is the return value: " + JSON.stringify(date));
		// if the month number is >12 luis gets that this has to be the month so dont change order in those cases.
		if (Number((returnedFromLuis as any)[0].entity.substring(0, 2)) > 12) {
			sanitizedDateArray[1] = false;
		}
		if (sanitizedDateArray[1]) {
			date = postProcessDate(date);
		}
		console.log(".........first: this is date to return1" + date);
		return date;
	} catch (err) {
		console.log("ERROR HAPPENED: " + err);
		return err;
	}

}

function getDateFromLuisAsync(sanitizedDateArray: any[]): Promise<any> {
	// https://stackoverflow.com/questions/22519784/how-do-i-convert-an-existing-callback-api-to-promises
	return new Promise((resolve, reject) => {
		builder.LuisRecognizer.recognize(sanitizedDateArray[0], EnglishLuisModelUrl, (err, intents, entities) => {
			// if the month number is >12 luis gets that this has to be the month so dont change order in those cases.
			resolve(entities);
		});
	});
}

function sanitizeDatesForLuis(input: string): any[] {
	let toSanitize: string = input;
	// console.log(".......This is the input for sanitizing: " + toSanitize);
	toSanitize = toSanitize.toLowerCase();
	toSanitize = toSanitize.replace(/\./g, "-");
	toSanitize = toSanitize.replace(/januar|jan/gi, "january");
	toSanitize = toSanitize.replace(/februar|feb/gi, "february");
	toSanitize = toSanitize.replace(/märz/gi, "march");
	toSanitize = toSanitize.replace(/april/gi, "april");
	toSanitize = toSanitize.replace(/mai/gi, "may");
	toSanitize = toSanitize.replace(/juni/gi, "june");
	toSanitize = toSanitize.replace(/juli/gi, "july");
	toSanitize = toSanitize.replace(/august|aug/gi, "august");
	toSanitize = toSanitize.replace(/september|sept/gi, "september");
	toSanitize = toSanitize.replace(/oktober|okt/gi, "october");
	toSanitize = toSanitize.replace(/november|nov/gi, "november");
	toSanitize = toSanitize.replace(/dezember|dez/gi, "december");
	toSanitize = toSanitize.replace("heute", "today");
	toSanitize = toSanitize.replace(/gester|gestern/gi, "yesterday");
	if (toSanitize.includes("january" || "february" || "march" || "april" || "may" || "june" || "july" || "august" || "september" || "october" || "november" || "december")) {
		// no need to turn around month and day in this case
		const toReturn = [toSanitize, false];
		// console.log("............this is after sanitizing" + toReturn);
		return toReturn;
	} else {
		// turn around month and day in this case
		const toReturn = [toSanitize, true];
		// console.log("............this is after sanitizing" + toReturn);
		return toReturn;
	}
}

function postProcessDate(input: string): string {
	const day = input.substring(5, 7);
	const month = input.substring(8, 10);
	const year = input.substring(0, 4);
	return `${year}-${month}-${day}`;
}
