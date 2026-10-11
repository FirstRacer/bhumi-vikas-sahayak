import React from 'react';
import { ShieldAlert, BookOpen } from 'lucide-react';

interface FooterProps {
  language: 'en' | 'hi';
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 mt-auto">
      {/* Upper Footer: Context & Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Col 1: System Identification */}
          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm">
              {language === 'hi' ? 'भूमि विकास सहायक' : 'Bhumi Vikas Sahayak'}
            </h3>
            <p className="text-slate-400 leading-relaxed">
              {language === 'hi'
                ? 'मध्य प्रदेश भूमि विकास नियम, 2012 (अद्यतन 06 मार्च 2025) के आधार पर नागरिकों, वास्तुकारों एवं नगर निगम अधिकारियों के लिए तकनीकी मार्गदर्शन पोर्टल।'
                : 'Technical guidance portal for citizens, architects, and municipal bodies based on the Madhya Pradesh Bhumi Vikas Rules, 2012 (amended up to 06 March 2025).'}
            </p>
          </div>

          {/* Col 2: Statutory Source References */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'hi' ? 'अधिसूचना संदर्भ' : 'Statutory Citations'}</span>
            </h4>
            <ul className="text-slate-400 space-y-1">
              <li>• MP Bhumi Vikas Rules, 2012 (Main Act)</li>
              <li>• Notification No. F-1-3-2012-XVIII-1 (2012 Gazette)</li>
              <li>• MP Gazette Extraordinary No. 104 (Amended 06 March 2025)</li>
              <li>• Urban Development and Housing Department, Bhopal</li>
            </ul>
          </div>

          {/* Col 3: Legal Disclaimer Notice */}
          <div className="space-y-2 bg-slate-800/60 p-3.5 rounded border border-slate-700">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{language === 'hi' ? 'महत्वपूर्ण विधिक अस्वीकरण' : 'Statutory Disclaimer'}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'यह प्रणाली केवल सूचनात्मक एवं तकनीकी मार्गदर्शन के लिए है। यह नगर पालिक निगम/टाउन एंड कंट्री प्लानिंग का आधिकारिक अनुमोदन या भवन अनुज्ञा पत्र नहीं है। वैधानिक अनुज्ञा हेतु संबंधित सक्षम प्राधिकारी को आवेदन करें।'
                : 'This system is for technical guidance and informational reference only. It does not constitute formal statutory approval or a building permit. Formal permissions must be obtained from the competent municipal or Town & Country Planning authority.'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="bg-slate-950 border-t border-slate-800/80 py-3 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} Bhumi Vikas Sahayak | Government of Madhya Pradesh — Building Rules Assistance
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Bhopal Impact Lab</span>
            <span>•</span>
            <span>MP e-Governance Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
