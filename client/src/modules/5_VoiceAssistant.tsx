import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, HelpCircle } from 'lucide-react';
import { EvidenceBadge } from '../components/EvidenceBadge';
import type { Citation } from '../components/EvidenceBadge';
import { authenticatedFetch } from '../utils/auth';

interface VoiceAssistantProps {
  language: 'en' | 'hi';
}

export const VoiceAssistantModule: React.FC<VoiceAssistantProps> = ({ language }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [evidenceSufficient, setEvidenceSufficient] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Hindi voice input

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Browser does not support Web Speech API. You can select standard pre-recorded inquiries.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSpeak = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = textToSpeak
      .replace(/[*#_`]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const submitSpokenQuery = async (queryText?: string) => {
    const textToSubmit = queryText || transcript;
    if (!textToSubmit.trim() || loading) return;

    setLoading(true);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const res = await authenticatedFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSubmit, language: 'hi' })
      });
      const data = await res.json();
      setResponseText(data.reply);
      setCitations(data.citations || []);
      setEvidenceSufficient(data.evidenceSufficient ?? true);

      handleSpeak(data.reply);
    } catch (err) {
      console.error(err);
      setResponseText('सर्वर से उत्तर प्राप्त करने में असमर्थ।');
    } finally {
      setLoading(false);
    }
  };

  const sampleHindiVoiceQueries = [
    '24 मीटर सड़क पर भोपाल में अधिकतम FAR और ऊंचाई क्या है?',
    'नियम 21 के अंतर्गत भवन निर्माण अनुमति की फीस कितनी है?',
    'नियम 84 के तहत पार्किंग की क्या आवश्यकताएं हैं?',
    'क्या 12 मीटर चौड़ी सड़क पर ग्रुप हाउसिंग की अनुमति है?'
  ];

  return (
    <div className="space-y-5">
      {/* Module Card */}
      <div className="bg-white rounded border border-slate-300 shadow-xs overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-3.5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center space-x-2">
              <Mic className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'हिंदी ध्वनि सहायता' : 'Hindi Voice Assistance'}</span>
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {language === 'hi'
                ? 'हिंदी वाणी इनपुट द्वारा प्रश्न पूछें एवं आधिकारिक नियमों से वाचन सुनें'
                : 'Spoken Hindi inquiry system with audio feedback based on MP Bhumi Vikas Rules'}
            </p>
          </div>
          <div className="text-[11px] bg-slate-700 border border-slate-600 px-2.5 py-1 rounded text-slate-200">
            {language === 'hi' ? 'ध्वनि इंटरफ़ेस' : 'Voice Interface'}
          </div>
        </div>

        {/* Mic Control */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-50 border-b border-slate-200">
          <button
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition border cursor-pointer ${
              isListening
                ? 'bg-red-700 text-white border-red-800 ring-4 ring-red-200'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-800 ring-2 ring-slate-300'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          <p className="mt-3 text-xs font-semibold text-slate-700">
            {isListening ? 'ध्वनि ग्रहण की जा रही है... (बोलें)' : 'माइक्रोफ़ोन सक्रिय करने हेतु बटन दबाएं'}
          </p>

          <div className="mt-4 w-full max-w-xl">
            <div className="bg-white border border-slate-300 rounded p-3 text-xs text-slate-900 min-h-[46px] flex items-center justify-between">
              <span className={transcript ? 'text-slate-900 font-medium' : 'text-slate-500 italic'}>
                {transcript || 'उदा.: "24 मीटर सड़क पर FAR और ऊंचाई के क्या नियम हैं?"'}
              </span>
              {transcript && (
                <button
                  onClick={() => submitSpokenQuery()}
                  disabled={loading}
                  className="ml-3 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer flex-shrink-0"
                >
                  पूछें
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Voice Inquiries */}
        <div className="p-4 bg-white">
          <div className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>मानक हिंदी प्रश्न (परीक्षण हेतु):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleHindiVoiceQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(q);
                  submitSpokenQuery(q);
                }}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs px-2.5 py-1 rounded transition cursor-pointer"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer Area */}
      {(responseText || loading) && (
        <div className="bg-white rounded border border-slate-300 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              सहायता केंद्र उत्तर (विहित नियमों के अनुसार):
            </h3>
            {responseText && (
              <button
                onClick={() => handleSpeak(responseText)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer border ${
                  isSpeaking
                    ? 'bg-red-50 text-red-800 border-red-300'
                    : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3 h-3" />
                    <span>रोकें</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3" />
                    <span>आवाज में सुनें</span>
                  </>
                )}
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-6 flex items-center justify-center space-x-2 text-slate-600 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
              <span>उत्तर संकलित किया जा रहा है...</span>
            </div>
          ) : (
            <div className="mt-3 text-xs leading-relaxed text-slate-900 whitespace-pre-wrap">
              {responseText}
              <EvidenceBadge
                citations={citations}
                evidenceSufficient={evidenceSufficient}
                language={language}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
