/// <reference path="../node_modules/botbuilder/lib/botbuilder.d.ts" />
import * as builder from "botbuilder";

let conn = new builder.ConsoleConnector().listen();
// bot takes connector and default dialog
let bot = new builder.UniversalBot(conn);

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