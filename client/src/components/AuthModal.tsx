import React, { useState } from 'react';
import { Building2, Lock, Mail, User, ArrowRight, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { setAuthSession, buildApiUrl } from '../utils/auth';

interface AuthModalProps {
  language: 'en' | 'hi';
  onAuthSuccess: (user: { id: string; name: string; email: string }) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({ language, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetFormState = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    if (!email || !password) {
      setError(language === 'hi' ? 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें।' : 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      setAuthSession(data.token, data.user);
      onAuthSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!name.trim()) {
      setError(language === 'hi' ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError(language === 'hi' ? 'कृपया एक मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError(language === 'hi' ? 'दोनों पासवर्ड मेल नहीं खाते हैं।' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      setAuthSession(data.token, data.user);
      onAuthSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!email.trim() || !email.includes('@')) {
      setError(language === 'hi' ? 'कृपया एक मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.resetToken) {
        setResetToken(data.resetToken);
        setSuccessMessage(
          language === 'hi'
            ? `रीसेट कोड जनरेट हुआ: "${data.resetToken}"। कृपया नीचे नया पासवर्ड निर्धारित करें।`
            : `Reset code generated: "${data.resetToken}". Please enter your new password below.`
        );
        setMode('reset');
      } else {
        setSuccessMessage(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!resetToken.trim()) {
      setError(language === 'hi' ? 'कृपया रीसेट कोड दर्ज करें।' : 'Please enter the reset code.');
      return;
    }
    if (newPassword.length < 6) {
      setError(language === 'hi' ? 'नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccessMessage(
        language === 'hi'
          ? 'पासवर्ड सफलतापूर्वक बदल दिया गया है। आप अब लॉगिन कर सकते हैं।'
          : 'Password reset successfully. You can now log in.'
      );
      setMode('login');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded border border-slate-300 shadow-xl overflow-hidden">
        {/* Tricolor Top Accent */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600" />

        {/* Portal Modal Header */}
        <div className="bg-slate-800 p-5 text-white border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {language === 'hi' ? 'नागरिक एवं पेशेवर लॉगिन' : 'Citizen & Technical Login'}
              </h2>
              <p className="text-[11px] text-slate-300">
                {language === 'hi'
                  ? 'भूमि विकास सहायक — मध्य प्रदेश शासन'
                  : 'Bhumi Vikas Sahayak — Govt. of Madhya Pradesh'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mode 1: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'पंजीकृत ईमेल पता' : 'Registered Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="architect@bhopal.gov.in"
                    className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {language === 'hi' ? 'पासवर्ड' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      resetFormState();
                      setMode('forgot');
                    }}
                    className="text-[11px] text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <span>{loading ? (language === 'hi' ? 'सत्यापन हो रहा है...' : 'Verifying...') : (language === 'hi' ? 'प्रवेश करें (Login)' : 'Sign In')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-200">
                <span>{language === 'hi' ? 'खाता नहीं है?' : "New user?"} </span>
                <button
                  type="button"
                  onClick={() => {
                    resetFormState();
                    setMode('signup');
                  }}
                  className="font-bold text-slate-900 underline hover:text-slate-700 cursor-pointer"
                >
                  {language === 'hi' ? 'नया नागरिक खाता बनाएं' : 'Create an Account'}
                </button>
              </div>
            </form>
          )}

          {/* Mode 2: Signup */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'पूरा नाम' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Er. Ramesh Sharma"
                    className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'ईमेल पता' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'पासवर्ड (न्यूनतम 6 अक्षर)' : 'Password (min. 6 chars)'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'पासवर्ड पुनः दर्ज करें' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <span>{loading ? (language === 'hi' ? 'पंजीकरण हो रहा है...' : 'Registering...') : (language === 'hi' ? 'पंजीकरण पूर्ण करें' : 'Register Account')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-200">
                <span>{language === 'hi' ? 'पहले से पंजीकृत हैं?' : 'Already registered?'} </span>
                <button
                  type="button"
                  onClick={() => {
                    resetFormState();
                    setMode('login');
                  }}
                  className="font-bold text-slate-900 underline hover:text-slate-700 cursor-pointer"
                >
                  {language === 'hi' ? 'लॉगिन करें' : 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* Mode 3: Forgot Password */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'अपना पंजीकृत ईमेल दर्ज करें। पासवर्ड रीसेट कोड उत्पन्न किया जाएगा।'
                  : 'Enter your registered email address to receive password reset instructions.'}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'पंजीकृत ईमेल' : 'Registered Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Processing...' : (language === 'hi' ? 'रीसेट कोड जारी करें' : 'Request Reset Code')}</span>
              </button>

              <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    resetFormState();
                    setMode('login');
                  }}
                  className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 cursor-pointer underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'लॉगिन पर लौटें' : 'Back to Login'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Mode 4: Reset Password */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'रीसेट कोड' : 'Reset Code / Token'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value)}
                    placeholder="rst_..."
                    className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs font-mono focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'नया पासवर्ड' : 'New Password (min 6 chars)'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <span>{loading ? 'Updating Password...' : (language === 'hi' ? 'पासवर्ड सुरक्षित करें' : 'Update Password')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    resetFormState();
                    setMode('login');
                  }}
                  className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 cursor-pointer underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'लॉगिन पर लौटें' : 'Back to Login'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
