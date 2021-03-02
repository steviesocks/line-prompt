const recorder = require('node-record-lpcm16');
// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
// Creates a client
const client = new speech.SpeechClient();
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';
const request = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  },
  interimResults: false,
  single_utterance: true
};
// Create a recognize stream
const recognizeStream = client
  .streamingRecognize(request)
  .on('error', console.error) 
  .on('data', data =>
    // process.stdout.write(
    //   data.results[0] && data.results[0].alternatives[0]
    //     ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
    //     : `\n\nReached transcription time limit, press Ctrl+C\n`
    // )
    console.log(data.results[0])
  );
// Start recording and send the microphone input to the Speech API
recorder.record({
    sampleRateHertz: sampleRateHertz,
    threshold: 0,
    // verbose: false,
    recorder: 'sox', // Try also "arecord" or "sox"
    silence: '10.0',
  })
  .stream()
  .on('error', console.error)
  .pipe(recognizeStream);
console.log('Listening, press Ctrl+C to stop.');