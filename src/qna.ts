// let basicQnAMakerDialog: any;

// basicQnAMakerDialog.invokeAnswer = (session, recognizeResult, threshold, noMatchMessage) => {
// 	var qnaMakerResult = recognizeResult;
// 	session.privateConversationData.qnaFeedbackUserQuestion = session.message.text;
// 	if (qnaMakerResult.score >= threshold && qnaMakerResult.answers.length > 0) {
// 		if (basicQnAMakerDialog.isConfidentAnswer(qnaMakerResult) || basicQnAMakerDialog.qnaMakerTools == null) {
// 			basicQnAMakerDialog.respondFromQnAMakerResult(session, qnaMakerResult);
// 			basicQnAMakerDialog.defaultWaitNextMessage(session, qnaMakerResult);
// 		}
// 		else {
// 			basicQnAMakerDialog.qnaFeedbackStep(session, qnaMakerResult);
// 		}
// 	}
// 	else {
// 		// Overridden case with this method
// 		noMatch(session, noMatchMessage, qnaMakerResult);
// 	}
// };

// function noMatch(session, noMatchMessage, qnaMakerResult) {
// 	session.beginDialog('/offer_transfer');
// };
