const facebookLoginWebview = [
	{
		"text": {
			"text": ["testing now"],
		},
		"platform": "FACEBOOK",
	},
	{
		"payload": {
			"facebook": {
				"attachment": {
					"payload": {
						"buttons": [
							{
								"url": "https://www.goflink.ch",
								"title": "Logi",
								"messenger_extensions": true,
								type: "web_url",
								webview_height_ratio: "compact",
							},
						],
						"template_type": "button",
						"text": "login",
					},
					"type": "template",
				},
			},
		},
		platform: "FACEBOOK",
	},
	{
		text: {
		text: [
			"testing now",
		],
	},
}];
export default facebookLoginWebview;
