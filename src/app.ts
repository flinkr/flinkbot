/// <reference path="../node_modules/botbuilder/lib/botbuilder.d.ts" />
/// <reference path="../node_modules/@types/restify/index.d.ts" />


import * as builder from "botbuilder";
import * as restify from "restify";
import * as flinkapi from "./flinkapi";

let server = restify.createServer();
server.listen(process.env.port|| process.env.PORT || 3978, () => {
    console.log(`listening...${server.name}... ${server.url}`)
});

let conn = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

let bot = new builder.UniversalBot(conn);
//rout incoming posts to the handler conn.listen
server.post("/api/messages", conn.listen());

//Waterfall method, goes from function to function, tells it whats next
bot.dialog("/", [
	(sess, args, next) => {
		if(!sess.userData.authToken){
			sess.beginDialog("/login")
		}
		else{
			next();
		}
	},

    (sess, result) => {
        builder.Prompts.text(sess, `Hi, your authtoken is ${sess.userData.authToken} what is your email address?`);
    },
    (sess, result) =>{
		 sess.userData.email = result;
		 builder.Prompts.text(sess, "Ok, whats your password?");
	},
    (sess, result) =>{
		 sess.userData.password = result;
		 //will be set asynchonously
		 (async () => sess.userData.zipCode = await flinkapi.getZipCode())();
		 builder.Prompts.choice(sess, "Do you want to print your token now?", [
			 "Yes", "No"
		 ]);
	},
	(sess, result) =>
	{
		 if(result.response.entity === "Yes"){
			sess.send(`Ok, this is your ZipCode ${sess.userData.zipCode}`)
		 }else{
			 //go back to root dialog, start over
			 sess.replaceDialog("/");
		 }
	}
]);

bot.dialog("/login", [
	(sess, args, next) =>{
		builder.Prompts.text(sess, "Hi, user, what is your authToken?")
	},
	(sess, result) => {
		sess.userData.authToken = result.response;
		sess.endDialog();
	}
])
