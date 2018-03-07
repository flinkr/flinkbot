import * as builder from "botbuilder";

// Select Damage type
export function createHeroCard_damageType(session: builder.Session): any {
	return new builder.HeroCard(session)
		.title("Um welche Art von Schaden handelt es sich?")
		// .subtitle("Your bots — wherever your users are talking")
		// .text("Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.")
		// .images([
		// 	builder.CardImage.create(session, "https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg"),
		// ])
		.buttons([
			builder.CardAction.imBack(session, `Sachen von jemand anderem beschädigt`, "Sachen von jemand anderem beschädigt"),
			builder.CardAction.imBack(session, `Schaden an Mietwohnung`, "Schaden an Mietwohnung"),
			builder.CardAction.imBack(session, `Ich habe jemanden verletzt`, "Ich habe jemanden verletzt"),
		]);
}

// Template:
// export function createHeroCard_damageType(session: builder.Session): any {
// 	return new builder.HeroCard(session)
// 		.title("BotFramework Hero Card")
// 		.subtitle("Your bots — wherever your users are talking")
// 		.text("Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.")
// 		.images([
// 			builder.CardImage.create(session, "https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg"),
// 		])
// 		.buttons([
// 			builder.CardAction.openUrl(session, "https://www.goflink.ch", "Get Started"),
// 			builder.CardAction.imBack(session, `click`, "Click"),
// 			builder.CardAction.imBack(session, `clack`, "Clack"),
// 		]);
// }
