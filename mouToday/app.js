const fs = require("fs");
const sdk = require("microsoft-cognitiveservices-speech-sdk");

// This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
const speechConfig = sdk.SpeechConfig.fromSubscription("69cd72a7713e4d07be00ac974ba7ceb5", "centralindia");
speechConfig.speechRecognitionLanguage = "en-US";

function fromFile() {
	let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync("myAud.wav"));
	let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

	speechRecognizer.recognizeOnceAsync(result => {
		switch (result.reason) {
			case sdk.ResultReason.RecognizedSpeech:
				console.log(`RECOGNIZED: Text=${result.text}`);
				break;
			case sdk.ResultReason.NoMatch:
				console.log("NOMATCH: Speech could not be recognized.");
				break;
			case sdk.ResultReason.Canceled:
				const cancellation = sdk.CancellationDetails.fromResult(result);
				console.log(`CANCELED: Reason=${cancellation.reason}`);

				if (cancellation.reason == sdk.CancellationReason.Error) {
					console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
					console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
					console.log("CANCELED: Did you set the speech resource key and region values?");
				}
				break;
		}
		speechRecognizer.close();
	});
}
fromFile();