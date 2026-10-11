import React from 'react';
import {
  MessageSquare,
  Calculator,
  FileCheck2,
  FileSpreadsheet,
  Mic,
  GitCompare,
  CheckCircle,
  PhoneCall,
  ChevronRight
} from 'lucide-react';

export type ModuleId =
  | 'chatbot'
  | 'calculator'
  | 'plan-checker'
  | 'amendments'
  | 'voice-assistant'
  | 'comparison'
  | 'verification';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  language: 'en' | 'hi';
}

interface NavItem {
  id: ModuleId;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onSelectModule, language }) => {
  const items: NavItem[] = [
    {
      id: 'chatbot',
      titleEn: '1. Building Rules — Ask a Question',
      titleHi: '1. भवन नियम — प्रश्न पूछें',
      descriptionEn: 'Official helpdesk grounded in gazetted rules',
      descriptionHi: 'आधिकारिक राजपत्र नियमों पर आधारित उत्तर',
      icon: <MessageSquare className="w-4 h-4 flex-shrink-0" />
    },
    {
      id: 'calculator',
      titleEn: '2. Building Limit Calculator',
      titleHi: '2. भवन सीमा कैलकुलेटर',
      descriptionEn: 'Statutory FAR, height & setback limits',
      descriptionHi: 'सत्यापित FAR, ऊंचाई व सेटबैक सीमाएं',
      icon: <Calculator className="w-4 h-4 flex-shrink-0" />
    },
    {
      id: 'plan-checker',
      titleEn: '3. Building Plan Checker',
      titleHi: '3. भवन नक्शा अनुपालन जांच',
      descriptionEn: 'Pre-check plan drawings & specifications',
      descriptionHi: 'नक्शा ड्राइंग व विनिर्देशों की पूर्व-जांच',
      icon: <FileCheck2 className="w-4 h-4 flex-shrink-0" />
    },
    {
      id: 'amendments',
      titleEn: '4. Rule Amendments',
      titleHi: '4. नियम संशोधन',
      descriptionEn: 'MP Gazette notifications up to 2025',
      descriptionHi: '2025 तक अद्यतन राजपत्र अधिसूचनाएं',
      icon: <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
    },
    {
      id: 'voice-assistant',
      titleEn: '5. Hindi Voice Assistance',
      titleHi: '5. हिंदी ध्वनि सहायता',
      descriptionEn: 'Voice input and spoken Hindi answers',
      descriptionHi: 'ध्वनि इनपुट एवं हिंदी वाचन उत्तर',
      icon: <Mic className="w-4 h-4 flex-shrink-0" />
    },
    {
      id: 'comparison',
      titleEn: '6. Rule Comparison',
      titleHi: '6. नियम तुलना',
      descriptionEn: '2012 baseline vs. 2025 gazetted norms',
      descriptionHi: '2012 मूल नियम बनाम 2025 संशोधन',
      icon: <GitCompare className="w-4 h-4 flex-shrink-0" />
    },
    {
      id: 'verification',
      titleEn: '7. Answer Sources & Verification',
      titleHi: '7. उत्तर स्रोत एवं सत्यापन',
      descriptionEn: 'Statutory cross-checks and audit trail',
      descriptionHi: 'साक्ष्य मिलान एवं विनियामक ऑडिट',
      icon: <CheckCircle className="w-4 h-4 flex-shrink-0" />
    }
  ];

  return (
    <aside className="w-full md:w-80 flex-shrink-0 space-y-4">
      {/* Navigation Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {language === 'hi' ? 'पोर्टल मॉड्यूल सूची' : 'Administrative Modules'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === 'hi' ? 'सेवा चयन करें' : 'Select a regulatory module'}
            </p>
          </div>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
            7 Modules
          </span>
        </div>

        <nav className="p-2 space-y-1">
          {items.map(item => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition cursor-pointer group ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-start space-x-2.5 min-w-0">
                  <span className={`mt-0.5 ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-800'}`}>
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">
                      {language === 'hi' ? item.titleHi : item.titleEn}
                    </div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {language === 'hi' ? item.descriptionHi : item.descriptionEn}
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ml-1.5 transition ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:translate-x-0.5'}`} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Official Help & Support Card (Inspired by the sidebar contact / presentation card in reference) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-3">
        <div className="flex items-center space-x-2 font-bold text-slate-900">
          <PhoneCall className="w-4 h-4 text-amber-600" />
          <span>{language === 'hi' ? 'नागरिक सहायता केंद्र' : 'Citizen Helpdesk Support'}</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {language === 'hi'
            ? 'भवन अनुज्ञा, ऑनलाइन आवेदन अथवा नियम व्याख्या में सहायता हेतु नगर निगम संपर्क केंद्र से संपर्क करें।'
            : 'For inquiries regarding building sanctions, rule interpretation, or online submission, reach municipal support.'}
        </p>
        <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Toll-Free Helpline:</span>
            <span className="font-bold text-slate-900 font-mono">1800-233-5555</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Authority:</span>
            <span className="font-semibold text-slate-800">BMC & T&CP Bhopal</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
