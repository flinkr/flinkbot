// format according to channel's requirements
// https://github.com/Microsoft/BotBuilder-Samples/blob/master/Node/blog-customChannelData/app.js
// https://developers.facebook.com/docs/messenger-platform/reference/buttons/url

export function fbWebviewLogin(): object {
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
									url: "https://www.goflink.ch",
									title: "Login",
									webview_height_ratio: "compact",
									// "messenger_extensions": true,
								},
							],
						},
					],
				},
			},
		},
	};
}
