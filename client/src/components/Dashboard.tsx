import React from 'react';
import {
  MessageSquare,
  Calculator,
  FileCheck2,
  FileSpreadsheet,
  Mic,
  GitCompare,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export type ModuleId =
  | 'chatbot'
  | 'calculator'
  | 'plan-checker'
  | 'amendments'
  | 'voice-assistant'
  | 'comparison'
  | 'verification';

interface DashboardProps {
  language: 'en' | 'hi';
  onSelectModule: (id: ModuleId) => void;
}

interface ModuleCardItem {
  id: ModuleId;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  icon: React.ReactNode;
}

export const Dashboard: React.FC<DashboardProps> = ({ language, onSelectModule }) => {
  const modules: ModuleCardItem[] = [
    {
      id: 'chatbot',
      titleEn: 'AI Regulatory Chatbot',
      titleHi: 'एआई विनियामक चैटबॉट',
      descriptionEn: 'Ask building-rule questions in Hindi or English with verified statutory citations.',
      descriptionHi: 'भवन निर्माण नियमों, अनुमति एवं धाराओं के संबंध में प्रश्न पूछें और विहित संदर्भ प्राप्त करें।',
      icon: <MessageSquare className="w-4 h-4 text-slate-800" />
    },
    {
      id: 'calculator',
      titleEn: 'Smart Building Limit Calculator',
      titleHi: 'स्मार्ट भवन सीमा कैलकुलेटर',
      descriptionEn: 'Compute statutory FAR, permissible building height, and open setbacks.',
      descriptionHi: 'सड़क चौड़ाई व भूखंड आधार पर विहित FAR, अधिकतम ऊंचाई एवं सेटबैक की गणना करें।',
      icon: <Calculator className="w-4 h-4 text-slate-800" />
    },
    {
      id: 'plan-checker',
      titleEn: 'Building Plan Checker',
      titleHi: 'भवन नक्शा अनुपालन जांच',
      descriptionEn: 'Pre-check building plan parameters and drawings against gazetted standards.',
      descriptionHi: 'भवन नक्शा विनिर्देशों की विधिक प्रावधानों एवं सीमाओं के आधार पर पूर्व-जांच करें।',
      icon: <FileCheck2 className="w-4 h-4 text-slate-800" />
    },
    {
      id: 'amendments',
      titleEn: 'Rule Amendments',
      titleHi: 'नियम संशोधन',
      descriptionEn: 'Review official MP Gazette notifications and amendments up to 06 March 2025.',
      descriptionHi: '06 मार्च 2025 तक मध्य प्रदेश राजपत्र असाधारण द्वारा जारी आधिकारिक संशोधन देखें।',
      icon: <FileSpreadsheet className="w-4 h-4 text-slate-800" />
    },
    {
      id: 'voice-assistant',
      titleEn: 'Voice-Based Hindi Assistant',
      titleHi: 'ध्वनि-आधारित हिंदी सहायक',
      descriptionEn: 'Speak questions aloud in Hindi and listen to official building regulations.',
      descriptionHi: 'हिंदी में बोलकर भवन नियम संबंधी प्रश्न पूछें और आवाज में आधिकारिक उत्तर सुनें।',
      icon: <Mic className="w-4 h-4 text-slate-800" />
    },
    {
      id: 'comparison',
      titleEn: 'Rule Comparison Dashboard',
      titleHi: 'नियम तुलनात्मक डैशबोर्ड',
      descriptionEn: 'Compare baseline 2012 provisions with current 2025 gazetted rules side by side.',
      descriptionHi: 'मूल 2012 नियमों और 2025 के नवीनतम संशोधनों का पक्ष-दर-पक्ष तुलनात्मक विश्लेषण देखें।',
      icon: <GitCompare className="w-4 h-4 text-slate-800" />
    },
    {
      id: 'verification',
      titleEn: 'Answer Verification',
      titleHi: 'उत्तर स्रोत एवं सत्यापन',
      descriptionEn: 'Verify regulatory claims against official rules and flag evidence gaps.',
      descriptionHi: 'कथनों को विहित नियमों से सत्यापित करें और अपुष्ट दावों को समीक्षा हेतु चिह्नित करें।',
      icon: <CheckCircle className="w-4 h-4 text-slate-800" />
    }
  ];

  return (
    <div className="space-y-4">
      {/* Short Dashboard Header */}
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {language === 'hi' ? 'भवन नियम सेवा डैशबोर्ड' : 'Building Rules Services Dashboard'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'hi'
              ? 'मध्य प्रदेश भूमि विकास नियम, 2012 (अद्यतन 2025) — किसी भी सेवा पर क्लिक करें।'
              : 'MP Bhumi Vikas Rules, 2012 (2025 Edition) — Select a service to begin.'}
          </p>
        </div>
        <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded self-start sm:self-auto border border-slate-200">
          {language === 'hi' ? '7 मॉड्यूल' : '7 Modules'}
        </span>
      </div>

      {/* Compact Consistent 3-Column Grid on Desktop, Single-Column on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {modules.map(mod => (
          <div
            key={mod.id}
            onClick={() => onSelectModule(mod.id)}
            className="bg-white border border-slate-200 hover:border-slate-400 rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Card Header: Small Icon & Title */}
              <div className="flex items-center space-x-2.5 mb-1.5">
                <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 group-hover:border-amber-300 transition">
                  {mod.icon}
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800 transition truncate">
                  {language === 'hi' ? mod.titleHi : mod.titleEn}
                </h2>
              </div>

              {/* Short Description */}
              <p className="text-xs text-slate-600 leading-normal line-clamp-2">
                {language === 'hi' ? mod.descriptionHi : mod.descriptionEn}
              </p>
            </div>

            {/* Subtle Clickable Action */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-700 group-hover:text-slate-900">
              <span>{language === 'hi' ? 'खोलें' : 'Open'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
