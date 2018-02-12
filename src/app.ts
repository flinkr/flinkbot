/// <reference path="../node_modules/botbuilder/lib/botbuilder.d.ts" />
import * as builder from "botbuilder";

let conn = new builder.ConsoleConnector().listen();
// bot takes connector and default dialog
let bot = new builder.UniversalBot(conn, (sess) =>{
    sess.send("welcome to my bot!");
})