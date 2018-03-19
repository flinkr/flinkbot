import * as IBAN from "iban";
/* tslint:disable */
const colors: any = require("colors");
/* tslint:enable */
colors.enabled = true;

export function extractIban(input: string): string {
	// remove whitespace
	input = input.replace(/\s/g, '');
	input = input.toUpperCase();
	let ibanPosition: number;
	ibanPosition = input.search('CH');
	const iban: string = input.substring(ibanPosition, ibanPosition + 21);
	console.log(`string is: ${input}`.cyan);
	console.log(`position is: ${ibanPosition}`.cyan);
	console.log(`IBAN is : ${iban}`.cyan);
	if (!IBAN.isValid(iban)) {
		return "false";
	} else {
		return iban;
	}
}
