import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ShieldCheck, User, Mail, Briefcase, KeyRound, CheckCircle2,
  AlertCircle, Database, ArrowRight, Eye, EyeOff, Lock, ArrowLeft, UserPlus, LogIn, AlertTriangle
} from 'lucide-react';

/* Constants & Helpers from LoginModal */
const PRESET_ROLES = [
  'Lead SecOps Analyst', 'Chief Information Security Officer (CISO)',
  'Threat Intelligence Specialist', 'Cloud Security Architect',
  'Incident Response Commander', 'Compliance & Risk Auditor',
];
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];
function isValidEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function passwordStrength(pw: string): 'weak' | 'fair' | 'strong' {
  if (pw.length < 8) return 'weak';
  const score = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(pw)).length;
  if (pw.length >= 10 && score >= 3) return 'strong';
  if (score >= 2) return 'fair';
  return 'weak';
}

const StrengthBar: React.FC<{ password: string }> = ({ password }) => {
  if (!password) return null;
  const strength = passwordStrength(password);
  const widths = { weak: 'w-1/3', fair: 'w-2/3', strong: 'w-full' };
  const colors = { weak: 'bg-red-500', fair: 'bg-amber-400', strong: 'bg-emerald-400' };
  const labels = { weak: 'Weak', fair: 'Fair', strong: 'Strong' };
  return (
    <div className="mt-1.5">
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${widths[strength]} ${colors[strength]}`} />
      </div>
      <p className={`text-[10px] mt-0.5 font-mono ${colors[strength].replace('bg-', 'text-')}`}>
        Password strength: {labels[strength]}
      </p>
    </div>
  );
};

const PasswordInput: React.FC<{
  id: string; placeholder?: string; value: string; onChange: (v: string) => void; showStrength?: boolean;
}> = ({ id, placeholder = '••••••••', value, onChange, showStrength }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="relative">
        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id={id} type={show ? 'text' : 'password'} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
        />
        <button
          type="button" onClick={() => setShow((s) => !s)} tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showStrength && <StrengthBar password={value} />}
    </div>
  );
};

const FeedbackBanner: React.FC<{ type: 'success' | 'error'; text: string; link?: string }> = ({ type, text, link }) => (
  <div className={`mx-6 mt-4 p-3 rounded-lg border text-xs flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 ${type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
    <div className="flex items-center gap-2.5">
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
      <span className="font-medium">{text}</span>
    </div>
    {link && (
      <div className="pl-6.5 text-[10px] break-all opacity-80 font-mono">
        Dev mode link: <a href={link} className="underline hover:text-white">{link}</a>
      </div>
    )}
  </div>
);

export const LoginPage: React.FC = () => {
  const { login, register, resetPassword, forgotPassword, isAuthenticated, switchUser, availableUsers, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  type TabId = 'signin' | 'register' | 'switch';
  type ViewId = 'main' | 'forgot' | 'reset';

  const resetToken = searchParams.get('reset');
  const [activeTab, setActiveTab] = useState<TabId>(
    location.pathname === '/register' || searchParams.get('tab') === 'register'
      ? 'register'
      : 'signin'
  );
  const [view, setView] = useState<ViewId>(resetToken ? 'reset' : 'main');

  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('register');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /* State */
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState(PRESET_ROLES[0]);
  const [regAvatar, setRegAvatar] = useState(PRESET_AVATARS[0]);

  const [fpEmail, setFpEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clearFeedback = () => setStatusMessage(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); clearFeedback();
    try {
      await login({ email: siEmail, password: siPassword });
      navigate('/');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally { setSubmitting(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) return setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
    if (passwordStrength(regPassword) === 'weak') return setStatusMessage({ type: 'error', text: 'Password is too weak.' });
    setSubmitting(true); clearFeedback();
    try {
      await register({ fullName: regFullName, email: regEmail, password: regPassword, role: regRole, avatarUrl: regAvatar });
      navigate('/');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally { setSubmitting(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); clearFeedback();
    try {
      const res = await forgotPassword(fpEmail);
      setStatusMessage({ type: 'success', text: res.message, link: res.devLink });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally { setSubmitting(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetNewPassword !== resetConfirmPassword) return setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
    setSubmitting(true); clearFeedback();
    try {
      await resetPassword({ token: resetToken!, newPassword: resetNewPassword });
      setStatusMessage({ type: 'success', text: 'Password reset successful! You can now sign in.' });
      setTimeout(() => {
        setSearchParams({});
        setView('main');
      }, 2000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally { setSubmitting(false); }
  };

  const handleQuickSwitch = async (selectedUser: any) => {
    setSubmitting(true);
    clearFeedback();
    try {
      await switchUser(selectedUser);
      navigate('/');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to switch session' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono';
  const labelClass = 'block text-xs font-semibold text-slate-300 mb-1.5';
  const submitClass = 'flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-lg bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-cyan-400 to-blue-600" />
        <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">RiskLens Platform</h2>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <Database className="w-3 h-3 text-emerald-400" /> Supabase PostgreSQL
              </p>
            </div>
          </div>
        </div>

        {view !== 'reset' && (
          <div className="flex px-6 pt-3 border-b border-slate-800/60 bg-slate-950/30 gap-6">
            <button onClick={() => { setActiveTab('signin'); setView('main'); clearFeedback(); }} className={`flex items-center gap-1.5 pb-3 text-xs font-semibold border-b-2 ${activeTab === 'signin' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400'}`}>Sign In</button>
            <button onClick={() => { setActiveTab('register'); setView('main'); clearFeedback(); }} className={`flex items-center gap-1.5 pb-3 text-xs font-semibold border-b-2 ${activeTab === 'register' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400'}`}>Register</button>
            <button onClick={() => { setActiveTab('switch'); setView('main'); clearFeedback(); }} className={`flex items-center gap-1.5 pb-3 text-xs font-semibold border-b-2 ${activeTab === 'switch' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400'}`}>Quick Switch</button>
          </div>
        )}

        {statusMessage && <FeedbackBanner type={statusMessage.type} text={statusMessage.text} link={statusMessage.link} />}

        {activeTab === 'signin' && view === 'main' && (
          <form onSubmit={handleSignIn} className="p-6 space-y-4">
            <div>
              <label className={labelClass}>Work Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" required value={siEmail} onChange={e => setSiEmail(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <PasswordInput id="si-password" value={siPassword} onChange={setSiPassword} />
            </div>
            <div className="flex justify-end -mt-2">
              <button type="button" onClick={() => { setView('forgot'); clearFeedback(); }} className="text-[11px] text-cyan-400 font-semibold">Forgot password?</button>
            </div>
            <button type="submit" disabled={!siEmail || !siPassword || submitting} className={submitClass}>{submitting ? 'Authenticating...' : 'Sign In'}</button>
          </form>
        )}

        {activeTab === 'signin' && view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
            <button type="button" onClick={() => setView('main')} className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1"><ArrowLeft className="w-3.5 h-3.5" /> Back</button>
            <div>
              <label className={labelClass}>Account Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" required value={fpEmail} onChange={e => setFpEmail(e.target.value)} className={inputClass} />
              </div>
            </div>
            <button type="submit" disabled={!fpEmail || submitting} className={submitClass}>{submitting ? 'Sending...' : 'Send Reset Token'}</button>
          </form>
        )}

        {view === 'reset' && (
          <form onSubmit={handleResetPassword} className="p-6 space-y-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs text-cyan-300">
              Enter your new password to reset your account credentials.
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <PasswordInput id="reset-pw" value={resetNewPassword} onChange={setResetNewPassword} showStrength />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <PasswordInput id="reset-cpw" value={resetConfirmPassword} onChange={setResetConfirmPassword} />
            </div>
            <button type="submit" disabled={!resetNewPassword || submitting} className={submitClass}>{submitting ? 'Resetting...' : 'Save New Password'}</button>
          </form>
        )}

        {activeTab === 'register' && view === 'main' && (
          <form onSubmit={handleRegister} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div><label className={labelClass}>Full Name</label><div className="relative"><User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input required value={regFullName} onChange={e => setRegFullName(e.target.value)} className={inputClass} /></div></div>
            <div><label className={labelClass}>Email Address</label><div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} className={inputClass} /></div></div>
            <div><label className={labelClass}>Password</label><PasswordInput id="reg-pw" value={regPassword} onChange={setRegPassword} showStrength /></div>
            <div><label className={labelClass}>Confirm Password</label><PasswordInput id="reg-cpw" value={regConfirmPassword} onChange={setRegConfirmPassword} /></div>
            <button type="submit" disabled={submitting} className={submitClass}>{submitting ? 'Creating...' : 'Register Account'}</button>
          </form>
        )}

        {activeTab === 'switch' && (
          <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
            <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-xs font-mono mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Demo / Dev Only</span>
            </div>
            {availableUsers.map(u => (
              <div key={u.id} onClick={() => handleQuickSwitch(u)} className="p-3 rounded-xl border flex items-center justify-between cursor-pointer bg-slate-900/60 border-slate-800 hover:bg-slate-800/80">
                <div className="flex items-center gap-3">
                  <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full" />
                  <div>
                    <div className="text-xs font-bold text-white">{u.fullName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
