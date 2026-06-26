
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { WindowState } from './types';

interface Props {
  windows: WindowState[];
  onClose: () => void;
  commands: {
    setTimer: (mins: number) => void;
    setTheme: (theme: string) => void;
    pinWindow: (id: string) => void;
    addIntention: (text: string) => void;
    toggleZen: () => void;
    desktopTidy: () => void;
  };
}

const EchoAssistant: React.FC<Props> = ({ windows, onClose, commands }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  // Tools for Voice Control
  const controlTools: FunctionDeclaration[] = [
    {
      name: 'set_focus_timer',
      parameters: {
        type: Type.OBJECT,
        properties: { minutes: { type: Type.NUMBER, description: 'Minutes for the focus timer' } },
        required: ['minutes'],
      }
    },
    {
      name: 'change_theme',
      parameters: {
        type: Type.OBJECT,
        properties: { theme: { type: Type.STRING, description: 'One of: nebula, sunrise, ocean, emerald' } },
        required: ['theme'],
      }
    },
    {
      name: 'pin_window',
      parameters: {
        type: Type.OBJECT,
        properties: { window_id: { type: Type.STRING, description: 'The ID of the window to pin' } },
        required: ['window_id'],
      }
    },
    {
      name: 'add_intention',
      parameters: {
        type: Type.OBJECT,
        properties: { text: { type: Type.STRING, description: 'Description of the new task' } },
        required: ['text'],
      }
    },
    {
      name: 'toggle_zen_mode',
      parameters: { type: Type.OBJECT, properties: {} }
    },
    {
      name: 'desktop_tidy',
      parameters: { type: Type.OBJECT, properties: {} }
    }
  ];

  const startSession = async () => {
    setIsConnecting(true);
    // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          setIsActive(true);
          setIsConnecting(false);
          const source = audioCtxRef.current!.createMediaStreamSource(stream);
          const processor = audioCtxRef.current!.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Calculate Audio Level for Visualizer
            let sum = 0;
            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
            setAudioLevel(Math.sqrt(sum / inputData.length));

            const pcmBlob = createBlob(inputData);
            // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput` to avoid race conditions.
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };
          
          source.connect(processor);
          processor.connect(audioCtxRef.current!.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          if (msg.serverContent?.outputTranscription) {
            const text = msg.serverContent.outputTranscription.text;
            setTranscription(prev => [...prev.slice(-4), `Echo: ${text}`]);
          }

          if (msg.toolCall) {
            for (const fc of msg.toolCall.functionCalls) {
              let result = "ok";
              // Fixed: Added explicit type casting for function arguments to fix TS 'unknown' errors (lines 112-115)
              if (fc.name === 'set_focus_timer') commands.setTimer(fc.args.minutes as number);
              if (fc.name === 'change_theme') commands.setTheme(fc.args.theme as string);
              if (fc.name === 'pin_window') commands.pinWindow(fc.args.window_id as string);
              if (fc.name === 'add_intention') commands.addIntention(fc.args.text as string);
              if (fc.name === 'toggle_zen_mode') commands.toggleZen();
              if (fc.name === 'desktop_tidy') commands.desktopTidy();
              
              sessionPromise.then(s => s.sendToolResponse({
                functionResponses: { id: fc.id, name: fc.name, response: { result } }
              }));
            }
          }

          const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64) {
            // Use a running timestamp to track the end of the audio playback queue for gapless playback
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtxRef.current!.currentTime);
            const buffer = await decodeAudioData(decode(audioBase64), outputCtxRef.current!, 24000, 1);
            const source = outputCtxRef.current!.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtxRef.current!.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }
        },
        onerror: (e) => console.error("Echo Error:", e),
        onclose: () => {
          setIsActive(false);
          setIsConnecting(false);
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        tools: [{ functionDeclarations: controlTools }],
        systemInstruction: `You are Echo, the PinPoint Pro workspace controller. 
        You help users manage their screen using tools. 
        Current workspace windows: ${windows.map(w => `${w.id}: ${w.title}`).join(', ')}.
        Be concise and helpful.`
      }
    });

    sessionRef.current = await sessionPromise;
  };

  const stopSession = () => {
    sessionRef.current?.close();
    audioCtxRef.current?.close();
    outputCtxRef.current?.close();
    setIsActive(false);
  };

  // Helper Functions - Implementing manual decode/encode as required by guidelines
  function decode(b64: string) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, rate: number, chans: number) {
    const data16 = new Int16Array(data.buffer);
    const count = data16.length / chans;
    const buffer = ctx.createBuffer(chans, count, rate);
    for (let c = 0; c < chans; c++) {
      const cData = buffer.getChannelData(c);
      for (let i = 0; i < count; i++) cData[i] = data16[i * chans + c] / 32768.0;
    }
    return buffer;
  }

  function createBlob(data: Float32Array) {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  }

  function encode(bytes: Uint8Array) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md glass border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center shadow-2xl">
        <div className="flex justify-between w-full mb-8">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Echo Live</span>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
          </div>
          <button onClick={() => { stopSession(); onClose(); }} className="text-slate-500 hover:text-white transition-colors">&times;</button>
        </div>

        {/* Visualizer */}
        <div className="h-24 w-full flex items-center justify-center space-x-1.5 mb-10">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="w-1.5 bg-indigo-500 rounded-full transition-all duration-75"
              style={{ 
                height: isActive ? `${20 + audioLevel * (200 + i * 20)}%` : '8px',
                opacity: isActive ? 0.3 + (i * 0.05) : 0.1,
                boxShadow: isActive ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none'
              }}
            />
          ))}
        </div>

        <div className="space-y-4 mb-10 w-full">
          {transcription.map((t, i) => (
            <p key={i} className="text-[10px] font-bold uppercase tracking-tight text-slate-400 border-l-2 border-indigo-500/20 pl-3 animate-in slide-in-from-left-2">{t}</p>
          ))}
          {transcription.length === 0 && !isConnecting && (
            <p className="text-xs text-slate-500 text-center italic">"Echo, pin my research window..."</p>
          )}
          {isConnecting && <p className="text-xs text-indigo-400 text-center animate-pulse">Initializing Neural Link...</p>}
        </div>

        <button 
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 transform hover:scale-105 active:scale-95 ${isActive ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'bg-indigo-600 shadow-lg shadow-indigo-600/30'}`}
        >
          <span className="text-2xl">{isActive ? '⏹️' : '🎙️'}</span>
        </button>

        <p className="mt-6 text-[9px] font-black uppercase tracking-widest text-slate-600">
          {isActive ? 'Echo is listening...' : 'Tap to start voice control'}
        </p>
      </div>
    </div>
  );
};

export default EchoAssistant;
