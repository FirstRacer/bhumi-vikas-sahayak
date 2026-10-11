import React, { useState } from 'react';
import { Send, Loader2, HelpCircle } from 'lucide-react';
import { EvidenceBadge } from '../components/EvidenceBadge';
import type { Citation } from '../components/EvidenceBadge';
import { authenticatedFetch } from '../utils/auth';

interface Message {
  id: string;
  sender: 'citizen' | 'desk';
  text: string;
  citations?: Citation[];
  evidenceSufficient?: boolean;
}

interface ChatbotProps {
  language: 'en' | 'hi';
}

export const ChatbotModule: React.FC<ChatbotProps> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'desk',
      text:
        language === 'hi'
          ? 'मध्य प्रदेश भवन विकास नियम सहायता केंद्र में आपका स्वागत है। आप मध्य प्रदेश भूमि विकास नियम, 2012 (अद्यतन 06 मार्च 2025) के आधार पर भवन अनुज्ञा, FAR, अधिकतम ऊंचाई, सेटबैक, अथवा पार्किंग के संबंध में प्रश्न पूछ सकते हैं। प्रत्येक उत्तर के साथ संबंधित नियम संख्या एवं पृष्ठ संख्या प्रदर्शित की जाएगी।'
          : 'Welcome to the Building Rules Helpdesk. You may submit technical or regulatory inquiries regarding the Madhya Pradesh Bhumi Vikas Rules, 2012 (amended up to 06 March 2025), including Floor Area Ratio (FAR), building height limits, parking norms, and open space requirements. Answers are provided with statutory citations.',
      evidenceSufficient: true,
      citations: [
        {
          ruleNumber: 'Overview',
          title: 'Madhya Pradesh Bhumi Vikas Rules, 2012',
          pageNumber: 1,
          sourceDoc: 'Gazette of MP (Extra-ordinary) 2012 / Updated up to 2025'
        }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    language === 'hi' ? '24 मीटर सड़क पर FAR और अधिकतम ऊंचाई क्या है?' : 'What is the permissible FAR and height on a 24m road?',
    language === 'hi' ? 'भवन अनुज्ञा आवेदन शुल्क नियम 21 में क्या निर्धारित है?' : 'What is the application fee under Rule 21 for building permission?',
    language === 'hi' ? 'नियम 84 के तहत पार्किंग (ECS) के क्या मानक हैं?' : 'What are the parking requirements and ECS norms under Rule 84?',
    language === 'hi' ? 'भवन की कुल ऊंचाई में कौन से रूफ स्ट्रक्चर शामिल नहीं होते?' : 'Which appurtenant roof structures are excluded from building height?'
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const citizenMsg: Message = {
      id: Date.now().toString(),
      sender: 'citizen',
      text: textToSend
    };

    setMessages(prev => [...prev, citizenMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await authenticatedFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, language })
      });
      const data = await response.json();

      const deskMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'desk',
        text: data.reply || 'No response available.',
        citations: data.citations || [],
        evidenceSufficient: data.evidenceSufficient ?? true
      };

      setMessages(prev => [...prev, deskMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'desk',
        text: language === 'hi'
          ? 'सर्वर से संपर्क करने में असमर्थ। कृपया जांचें कि बैकएंड सेवा सक्रिय है।'
          : 'Unable to connect to the backend server. Please verify system connection.',
        evidenceSufficient: false
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9.5rem)] min-h-[550px] bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      {/* Official Helpdesk Header */}
      <div className="px-5 py-3.5 bg-slate-800 text-white border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold tracking-normal flex items-center space-x-2">
            <span>{language === 'hi' ? 'भवन नियम सहायता केंद्र (Building Rules Helpdesk)' : 'Building Rules Helpdesk'}</span>
          </h2>
          <p className="text-[11px] text-slate-300 mt-0.5">
            {language === 'hi'
              ? 'मध्य प्रदेश भूमि विकास नियम, 2012 (संशोधित 2025) के तहत नागरिक परामर्श'
              : 'Citizen reference desk grounded strictly in official MP Gazette building regulations'}
          </p>
        </div>
        <div className="text-[11px] bg-slate-700 border border-slate-600 px-2.5 py-1 rounded text-slate-200 font-sans">
          {language === 'hi' ? 'नागरिक सेवा' : 'Citizen Assistance'}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'citizen' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Label */}
            <div className="text-[11px] font-semibold text-slate-500 mb-1 px-1">
              {m.sender === 'citizen'
                ? (language === 'hi' ? 'नागरिक प्रश्न' : 'Citizen Inquiry')
                : (language === 'hi' ? 'सहायता केंद्र उत्तर' : 'Helpdesk Response')}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-3xl rounded p-4 text-xs sm:text-sm leading-relaxed border ${
                m.sender === 'citizen'
                  ? 'bg-slate-900 text-white border-slate-800 ml-8'
                  : 'bg-white text-slate-900 border-slate-300 shadow-2xs mr-8'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
              {m.citations && (
                <EvidenceBadge
                  citations={m.citations}
                  evidenceSufficient={m.evidenceSufficient ?? true}
                  language={language}
                />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2.5 text-slate-600 text-xs py-2 bg-white px-3.5 rounded border border-slate-200 inline-flex shadow-2xs">
            <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
            <span>
              {language === 'hi'
                ? 'नियम विलेख से उत्तर संकलित किया जा रहा है...'
                : 'Processing statutory query against gazetted rules...'}
            </span>
          </div>
        )}
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200">
        <div className="flex items-center space-x-2 text-xs text-slate-700 overflow-x-auto pb-0.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="font-semibold flex-shrink-0">
            {language === 'hi' ? 'प्रायः पूछे जाने वाले प्रश्न:' : 'Common Inquiries:'}
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="bg-white border border-slate-300 hover:border-slate-500 hover:bg-slate-50 text-slate-800 px-2.5 py-1 rounded text-xs whitespace-nowrap transition cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Box */}
      <div className="p-3.5 bg-white border-t border-slate-200">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex space-x-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'नियम संख्या, FAR, सेटबैक, अथवा पार्किंग के संबंध में प्रश्न दर्ज करें...'
                : 'Enter your inquiry regarding Rule numbers, FAR, height, parking, or setbacks...'
            }
            className="flex-1 bg-white border border-slate-300 rounded px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded text-xs sm:text-sm font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <span>{language === 'hi' ? 'जमा करें' : 'Submit'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
