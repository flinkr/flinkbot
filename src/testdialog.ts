// class TestDialog {

// 	private bot: any;
// 	private lastName: string;

// 	constructor(bot: any) {
// 		this.bot = bot;
// 	}
// 	public function(bot: any): void {
// 		bot.dialog("/Test", [
// 			(session, args, next) => {
// 				console.log("test".green);
// 				session.send(`Test Dialog triggered`);
// 			},
// 		]).triggerAction({ matches: "test" });
// 	}
// }

// export = TestDialog;

// export default (bot) => {
// 	bot.dialog("/Test", [
// 		(session, args, next) => {
// 			console.log("test".green);
// 			session.send(`Test Dialog triggered`);
// 		},
// 	]).triggerAction({ matches: "test" });
// };
