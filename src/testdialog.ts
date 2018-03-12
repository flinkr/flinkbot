// import * as builder from "botbuilder";

// export default (bot: builder.UniversalBot): void => {
// 	bot.dialog("/Test", [
// 		(session, args, next) => {
// 			console.log("test".green);
// 			session.send(`Test Dialog triggered`);
// 		},
// 	]).triggerAction({ matches: "test" });
// };
//
//

import * as builder from 'botbuilder';

export const createLibrary = () => {
	let lib = new builder.Library('test');
	lib.dialog("/Test", [
		(session, args, next) => {
			console.log("test".green);
			session.send(`Test Dialog triggered`);
		},
	]).triggerAction({ matches: "test" });

	lib.dialog("/Hallo", [
		(session, args, next) => {
			console.log("hello".green);
			session.send(`Hello, Dialog triggered`);
		},
	]).triggerAction({ matches: "Hallo" });
	return lib.clone();
}
