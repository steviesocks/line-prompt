import React, { useEffect, useState, useRef } from 'react'
import io from "socket.io-client"
import ss from "socket.io-stream"
import RecordRTC, { StereoAudioRecorder } from 'recordrtc'
import './App.css';
import { placeholderScript } from './utils/placeholders';
import  { findCurrentWord } from './utils/responseHandlers';

const socket = io.connect('http://localhost:5000')

const SCRIPT_INITIAL_STATE = placeholderScript

function App() {

  const recorder = useRef(null);
  const micInput = useRef(null)
  const wordIndex = useRef({start: 0, end: 0})
  
  const [transcript, setTranscript] = useState("")
  const [audioSrc, setAudioSrc] = useState("")
  const [startDisabled, setStartDisabled] = useState(false)
  const [stopDisabled, setStopDisabled] = useState(true)
  const [script, setScript] = useState(<span>{SCRIPT_INITIAL_STATE}</span>)
  const [scrollPosition, setScrollPosition] = useState(0)

  const startListen = async () => {

    setStartDisabled(true)

    try {
      micInput.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      recorder.current = new RecordRTC(micInput.current, {
        type: 'audio',
        mimeType: 'audio/webm',
        sampleRate: '44100',
        desiredSampRate: '16000',
        recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1,
        timeSlice: 1500,
        ondataavailable: (blob) => {
          const stream = ss.createStream();
          ss(socket).emit('stream', stream, {
            name: 'stream.wav',
            size: blob.size
          });
          ss.createBlobReadStream(blob).pipe(stream)
        }
      })

      recorder.current.startRecording();

      setStopDisabled(false)
    }
    catch (err) {
      console.log(err)
    }
    
  }

  const stopListen = () => {
    recorder.current.stopRecording( () => {
        const link = recorder.current.toURL()
        setAudioSrc(link)
    })
    micInput.current.getTracks()[0].stop()

    setStopDisabled(true)
    setStartDisabled(false)
    setTranscript("")
    wordIndex.current = {start: 0, end: 0}
    setScript(SCRIPT_INITIAL_STATE)

    ss(socket).emit('stop', () => {})

  }




  useEffect(() => {
    const scrollBox = document.getElementById("scroll-box")

    socket.on('connection', () => {
      console.log('we are connected', socket.connected)
    })

    socket.on('results', (data) => {
      const { transcript } = data.alternatives[0]
      console.log('transcript:', transcript)
      setTranscript(prevState => prevState.concat(` ${data.alternatives[0].transcript}`))

      // console.log("old index", wordIndex.current)
      // console.log(script)
      const text = script.props.children
      wordIndex.current = findCurrentWord(text, transcript, wordIndex.current)
      // console.log("new index", wordIndex.current)

  
      setScript(
        <span>
          {text.slice(0, wordIndex.current.start)}
          <b>{text.slice(wordIndex.current.start, wordIndex.current.end)}</b>
          {text.slice(wordIndex.current.end)}
        </span>)
      


    })

  }, [])

  return (
    <div className="App" style={{ padding: '50px' }}>
      <button onClick={startListen} disabled={startDisabled}>start recording</button>
      <button onClick={stopListen} disabled={stopDisabled}>stop recording</button>
      <textarea id='results' style={{ width: '800px', height: '40px' }} value={transcript}></textarea>
      {/* <audio controls src={audioSrc}></audio> */}
      <div id="scroll-box" style={{height: '500px', overflow: 'auto', border: '2px solid blue', padding: '0 60px', scrollBehavior: 'smooth'}}>
        <p id="script" style={{whiteSpace: 'pre-wrap', fontSize: '50px'}}>{script}</p>
      </div>
      
    </div>
  );
}

export default App;
