# Microsoft Bot Framework Bot for Flink
This bot uses Bot Framework and Node.js. Intended to use with azure bot services.



Some personal Notes:
to run console bot, run node server.js
sess.endDialog(); returns to root dialog
put variables into strings in terminal: sess.send(`Hello, ${sess.userData.name}`);
use replaceDialog to ask to change dialog
use begindialog to ask for something and then return
catch text that user wrote: result.response.entity === "yes"
check which dialog the user came from directly (and not started over later)
- in the first append a arg to the replacedialog sess.replaceDialog("/noResults", {entry: "dialog"})
- in the secciond make if(args && args.entry && args.entry === "dialog")
Get what exactly the user typed in instead of just intend (and save it as dialog data):
-sess.dialogData.input = args.matched.input;
Types:
-sess: builder.Session
Get intentss => args.intent
For support of .env files, dotenv was used.
Issue with missing type definitions in azure botbuilder: https://github.com/Microsoft/BotBuilder-Azure/issues/38
