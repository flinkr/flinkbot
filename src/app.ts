/// <reference path="../node_modules/botbuilder/lib/botbuilder.d.ts" />
/// <reference path="../node_modules/@types/restify/index.d.ts" />


import * as builder from "botbuilder";
import * as restify from "restify";

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
        if(!sess.userData.name){
            builder.Prompts.text(sess, "Hello, user! What is your name?");
        }
        else{
            next();
        }
    },
    (sess, result) =>{
         sess.userData.name = result.response;
         sess.send(`Hello, ${sess.userData.name}`);
	}
]) 
