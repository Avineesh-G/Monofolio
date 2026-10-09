import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { MonofolioLogo } from '../../components/m3e';
import { Mail, Lock, ArrowRight, Sparkles, Shield, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export const AuthGateScreen: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(email.trim(), password);
        if (res.error) {
          setErrorMessage(res.error.message || 'Invalid email or password.');
        }
      } else {
        const res = await signUpWithEmail(email.trim(), password);
        if (res.error) {
          setErrorMessage(res.error.message || 'Sign up failed. Please try again.');
        } else {
          setSuccessMessage('Account created! Please check your email to confirm or sign in.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication encountered an error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setErrorMessage('');
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setErrorMessage(res.error.message || 'Google Sign-In failed.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google authentication error.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-between p-6 select-none relative overflow-hidden">
      {/* Dynamic Ambient Background Aura */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-tertiary/15 blur-3xl pointer-events-none" />

      {/* Header & Monogram Emblem */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center pt-6 space-y-3 relative z-10"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-[28px] bg-primary-container/80 flex items-center justify-center p-4 shadow-xl border border-outline-variant/10">
            <MonofolioLogo size={48} className="text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-surface-container-highest text-primary shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-on-surface">
            Monofolio
          </h1>
          <p className="text-xs text-on-surface-variant font-medium max-w-xs mx-auto leading-relaxed">
            Private Academic Vault, Syllabus Manager & Blunt AI Study Coach
          </p>
        </div>

        {/* Feature Micro-Badges */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="px-3 py-1 rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
            <Shield className="w-3 h-3 text-primary" />
            <span>End-to-End Private</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Groq Llama 3.3</span>
          </span>
        </div>
      </motion.div>

      {/* Main Authentication Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-auto my-auto p-6 rounded-[32px] bg-surface-container shadow-2xl border border-outline-variant/20 relative z-10 space-y-4"
      >
        {/* Google / Gmail Single Sign-On Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full py-3.5 px-4 rounded-2xl bg-surface-container-highest hover:bg-surface-container-lowest text-on-surface font-bold text-xs flex items-center justify-center gap-3 shadow-sm border border-outline-variant/15 active:scale-98 transition-all cursor-pointer"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google / Gmail</span>
        </button>

        {/* Visual Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-outline-variant/20" />
          <span className="text-[11px] font-bold text-on-surface-variant font-mono uppercase tracking-wider">
            or with email
          </span>
          <div className="flex-1 h-px bg-outline-variant/20" />
        </div>

        {/* Sign In vs Sign Up Segmented Switcher */}
        <div className="flex p-1 rounded-full bg-surface-container-high">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant font-mono px-1">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full bg-surface-container-high text-on-surface rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant font-mono px-1">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                className="w-full bg-surface-container-high text-on-surface rounded-2xl pl-10 pr-10 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to Monofolio' : 'Create Free Vault'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Footer Note */}
      <div className="text-center text-[10px] text-on-surface-variant/60 font-mono py-2">
        Protected by Supabase & PostgreSQL &bull; Monofolio v2.0
      </div>
    </div>
  );
};
