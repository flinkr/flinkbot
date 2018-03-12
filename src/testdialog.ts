import * as builder from 'botbuilder';

export const createLibrary = () => {
	const lib = new builder.Library('test');
	lib.dialog("/Test", [
		(session, args, next) => {
			console.log("test".green);
			session.send(`Test Dialog triggered`);
		},
	]).triggerAction({ matches: "test" });
	return lib.clone();
};
