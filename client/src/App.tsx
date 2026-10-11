import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Dashboard } from './components/Dashboard';
import type { ModuleId } from './components/Dashboard';
import { ModuleWrapper } from './components/ModuleWrapper';
import { ChatbotModule } from './modules/1_Chatbot';
import { CalculatorModule } from './modules/2_Calculator';
import { PlanCheckerModule } from './modules/3_PlanChecker';
import { AmendmentTrackerModule } from './modules/4_AmendmentTracker';
import { VoiceAssistantModule } from './modules/5_VoiceAssistant';
import { RuleComparisonModule } from './modules/6_RuleComparison';
import { VerificationAuditModule } from './modules/7_VerificationAudit';
import { getStoredUser, clearAuthSession, getAuthToken, authenticatedFetch } from './utils/auth';

type AppViewState = 'welcome' | 'dashboard' | 'module';

export const App: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Navigation State Flow:
  // 1. Auth Gate (Login/Signup) -> 2. 'welcome' -> 3. 'dashboard' -> 4. 'module'
  const [viewState, setViewState] = useState<AppViewState>('welcome');
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(() => getStoredUser());
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  useEffect(() => {
    // 1. Validate stored session with backend
    const token = getAuthToken();
    if (token) {
      authenticatedFetch('/api/auth/me')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Session invalid');
        })
        .then(data => {
          setCurrentUser(data.user);
        })
        .catch(() => {
          clearAuthSession();
          setCurrentUser(null);
        })
        .finally(() => {
          setIsAuthChecking(false);
        });
    } else {
      setIsAuthChecking(false);
    }

    // 2. Listen for session expiration events
    const handleSessionExpired = () => {
      setCurrentUser(null);
      setViewState('welcome');
      setActiveModule(null);
    };
    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setViewState('welcome');
    setActiveModule(null);
  };

  const handleAuthSuccess = (user: { id: string; name: string; email: string }) => {
    setCurrentUser(user);
    setViewState('welcome');
    setActiveModule(null);
  };

  const handleGetStarted = () => {
    setViewState('dashboard');
    setActiveModule(null);
  };

  const handleSelectModule = (id: ModuleId) => {
    setActiveModule(id);
    setViewState('module');
  };

  const handleBackToDashboard = () => {
    setActiveModule(null);
    setViewState('dashboard');
  };

  const handleGoHome = () => {
    if (currentUser) {
      setViewState('dashboard');
      setActiveModule(null);
    }
  };

  // STEP 1: Authentication Gate (Unauthenticated users see Login / Sign Up)
  if (!isAuthChecking && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
        <Header
          language={language}
          onToggleLanguage={toggleLanguage}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <AuthModal
            language={language}
            onAuthSuccess={handleAuthSuccess}
          />
        </main>
        <Footer language={language} />
      </div>
    );
  }

  // STEP 2, 3, 4: Authenticated User Flow
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header
        language={language}
        onToggleLanguage={toggleLanguage}
        currentUser={currentUser}
        onLogout={handleLogout}
        onGoHome={handleGoHome}
      />

      <div className="max-w-6xl w-full mx-auto p-4 sm:p-5 flex-1 flex flex-col">
        {/* VIEW 1: Welcome Screen (Minimal, short description, Get Started button) */}
        {viewState === 'welcome' && (
          <WelcomeScreen
            language={language}
            userName={currentUser?.name}
            onGetStarted={handleGetStarted}
          />
        )}

        {/* VIEW 2: Main Dashboard (Compact 3-column grid showing seven modules exactly once) */}
        {viewState === 'dashboard' && (
          <Dashboard
            language={language}
            onSelectModule={handleSelectModule}
          />
        )}

        {/* VIEW 3: Module View (Opens ONLY the selected module, with "Back to Dashboard" button) */}
        {viewState === 'module' && activeModule && (
          <ModuleWrapper
            language={language}
            moduleTitleEn={
              activeModule === 'chatbot' ? 'AI Regulatory Chatbot' :
              activeModule === 'calculator' ? 'Smart Building Limit Calculator' :
              activeModule === 'plan-checker' ? 'Building Plan Checker' :
              activeModule === 'amendments' ? 'Rule Amendments' :
              activeModule === 'voice-assistant' ? 'Voice-Based Hindi Assistant' :
              activeModule === 'comparison' ? 'Rule Comparison Dashboard' : 'Answer Verification'
            }
            moduleTitleHi={
              activeModule === 'chatbot' ? 'एआई विनियामक चैटबॉट' :
              activeModule === 'calculator' ? 'स्मार्ट भवन सीमा कैलकुलेटर' :
              activeModule === 'plan-checker' ? 'भवन नक्शा अनुपालन जांच' :
              activeModule === 'amendments' ? 'नियम संशोधन' :
              activeModule === 'voice-assistant' ? 'ध्वनि-आधारित हिंदी सहायक' :
              activeModule === 'comparison' ? 'नियम तुलनात्मक डैशबोर्ड' : 'उत्तर स्रोत एवं सत्यापन'
            }
            onBackToDashboard={handleBackToDashboard}
          >
            {activeModule === 'chatbot' && <ChatbotModule language={language} />}
            {activeModule === 'calculator' && <CalculatorModule language={language} />}
            {activeModule === 'plan-checker' && <PlanCheckerModule language={language} />}
            {activeModule === 'amendments' && <AmendmentTrackerModule language={language} />}
            {activeModule === 'voice-assistant' && <VoiceAssistantModule language={language} />}
            {activeModule === 'comparison' && <RuleComparisonModule language={language} />}
            {activeModule === 'verification' && <VerificationAuditModule language={language} />}
          </ModuleWrapper>
        )}
      </div>

      <Footer language={language} />
    </div>
  );
};

export default App;
