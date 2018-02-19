import * as rp from "request-promise";
import * as restify from "restify";

export async function getZipCode(token: string) {
	try {
		let userInfo = await getUserInfo(token);
		// tslint:disable-next-line:prefer-const
		let zipCode = userInfo.zipCode;
		console.log("this is your zip code" + zipCode);
		return zipCode;
	} catch (err) {
		return err;
	}
}

export function getUserInfo(token: string) {
	const options = {
		method: "GET",
		uri: "https://test.goflink.ch/api/v1/customers/me",
		headers: { Authorization: token },
		json: true, // Automatically stringifies the body to JSON
	};
	return rp(options);
}
