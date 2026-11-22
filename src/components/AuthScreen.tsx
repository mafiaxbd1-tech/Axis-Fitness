import React, { useState } from 'react';
import { signUp, logIn, startDemoLogin, UserSession } from '../lib/authService';
import { Dumbbell, ArrowRight, Loader2, Zap, AlertCircle } from 'lucide-react';
import { hasSupabaseConfig } from '../lib/supabaseClient';

interface AuthScreenProps {
  onAuthSuccess: (user: UserSession) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { user, error: authErr } = await logIn(email.trim(), password);
        if (authErr) {
          setError(authErr);
        } else if (user) {
          onAuthSuccess(user);
        }
      } else {
        const { user, error: authErr } = await signUp(email.trim(), password);
        if (authErr) {
          setError(authErr);
        } else if (user) {
          onAuthSuccess(user);
        }
      }
    } catch (err: any) {
      setError('Network error — try again');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStart = () => {
    const demoUser = startDemoLogin();
    onAuthSuccess(demoUser);
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-[#EEEEEE] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[420px] bg-[#111111] border border-[#1E1E1E] rounded-[10px] p-6 shadow-xl flex flex-col items-center">
        
        {/* Logo Branding */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-[#CAFF00] flex items-center justify-center text-[#0A0A0A] font-black shadow-[0_0_20px_rgba(202,255,0,0.3)]">
            <Dumbbell className="w-7 h-7 transform -rotate-45" />
          </div>
          <h1 className="text-3xl font-black tracking-wider uppercase text-[#EEEEEE]">
            Axis <span className="text-[#CAFF00]">Fitness</span>
          </h1>
        </div>
        <p className="text-[#555555] text-xs font-bold uppercase tracking-widest mb-6">
          Personal Training & Nutrition Tracker
        </p>

        {/* Mode Toggle */}
        <div className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-[8px] p-1 grid grid-cols-2 mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`text-xs font-bold uppercase py-2.5 rounded-[6px] transition-all ${
              isLogin 
                ? 'bg-[#CAFF00] text-[#0A0A0A] shadow-md' 
                : 'text-[#555555] hover:text-[#EEEEEE]'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`text-xs font-bold uppercase py-2.5 rounded-[6px] transition-all ${
              !isLogin 
                ? 'bg-[#CAFF00] text-[#0A0A0A] shadow-md' 
                : 'text-[#555555] hover:text-[#EEEEEE]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error inline message */}
        {error && (
          <div className="w-full bg-red-950/40 border border-red-500/50 rounded-[8px] p-3 mb-6 flex items-start gap-2.5 text-red-400 text-xs font-semibold animate-checkmark">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-[#555555] text-[10px] font-bold uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@example.com"
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] focus:border-[#CAFF00] rounded-[8px] px-4 py-3 text-sm text-[#EEEEEE] placeholder-[#555555] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#555555] text-[10px] font-bold uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] focus:border-[#CAFF00] rounded-[8px] px-4 py-3 text-sm text-[#EEEEEE] placeholder-[#555555] outline-none transition-colors"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[#555555] text-[10px] font-bold uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] focus:border-[#CAFF00] rounded-[8px] px-4 py-3 text-sm text-[#EEEEEE] placeholder-[#555555] outline-none transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#CAFF00] hover:bg-[#b8e600] active:scale-[0.98] disabled:opacity-50 text-[#0A0A0A] font-black uppercase text-sm py-3.5 px-4 rounded-[8px] flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(202,255,0,0.25)] transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? 'Log into Axis' : 'Start Axis Fitness'}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-[#1E1E1E]"></div>
          <span className="text-[#555555] text-[10px] font-bold uppercase tracking-widest">Or</span>
          <div className="flex-1 h-[1px] bg-[#1E1E1E]"></div>
        </div>

        {/* Demo Button */}
        <button
          type="button"
          onClick={handleDemoStart}
          className="w-full bg-[#1E1E1E] hover:bg-[#282828] active:scale-[0.98] text-[#EEEEEE] font-bold uppercase text-xs py-3 px-4 rounded-[8px] flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#333333]"
        >
          <Zap className="w-4 h-4 text-[#CAFF00]" />
          <span>Quick Demo / Local Mode</span>
        </button>

        {/* Status Indicator */}
        <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold text-[#555555] uppercase">
          <div className={`w-2 h-2 rounded-full ${hasSupabaseConfig ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          <span>{hasSupabaseConfig ? 'Supabase Auth Active' : 'Fallback / Local Mode Ready'}</span>
        </div>
      </div>
    </div>
  );
};
