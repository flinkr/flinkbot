// format according to channel's requirements
// https://github.com/Microsoft/BotBuilder-Samples/blob/master/Node/blog-customChannelData/app.js
// https://developers.facebook.com/docs/messenger-platform/reference/buttons/url

export function fbWebviewLogin(webviewUrl: string, userId: string): object {
	return {
		facebook: {
			attachment: {
				type: "template",
				payload: {
					template_type: "generic",
					elements: [
						{
							title: "Bitte bei Flink einloggen",
							// subtitle: "This is subtitle",
							buttons: [
								{
									type: "web_url",
									url: `${webviewUrl}/login?userId=${userId}`,
									title: "Login",
									webview_height_ratio: "compact",
									messenger_extensions: true,
								},
							],
						},
					],
				},
			},
		},
	};
}

export function fbWebviewClaimObjects(webviewUrl: string, userId: string, currentClaimName: string): object {
	return {
		facebook: {
			attachment: {
				type: "template",
				payload: {
					template_type: "generic",
					elements: [
						{
							title: "Bitte hier klicken um die Details einzutragen:",
							// subtitle: "This is subtitle",
							buttons: [
								{
									type: "web_url",
									url: `${webviewUrl}/claimObjects?userId=${userId}&currentClaimName=${currentClaimName}`,
									title: "Los geht's",
									webview_height_ratio: "compact",
									messenger_extensions: true,
								},
							],
						},
					],
				},
			},
		},
	};
}
