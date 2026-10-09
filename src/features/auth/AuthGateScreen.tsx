import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { MonofolioLogo } from '../../components/m3e';
import { Mail, Lock, ArrowRight, ShieldCheck, Cpu, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export const AuthGateScreen: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsGuest } = useAuthStore();

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
          if (res.error.message.toLowerCase().includes('invalid login credentials')) {
            setErrorMessage('Account not found or password incorrect. If you haven\'t registered yet, switch to "Create Account" above to sign up first.');
          } else {
            setErrorMessage(res.error.message || 'Invalid email or password.');
          }
        }
      } else {
        const res = await signUpWithEmail(email.trim(), password);
        if (res.error) {
          setErrorMessage(res.error.message || 'Sign up failed. Please check your password (min 6 chars).');
        } else {
          setSuccessMessage('Account registered successfully! Signing you in...');
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
    <div
      className="min-h-screen bg-surface text-on-surface flex flex-col justify-between p-6 select-none relative overflow-hidden"
      style={{ fontFamily: "'Google Sans Flex', 'Google Sans', sans-serif" }}
    >
      {/* Soft Ambient Radial Lights (Zero Pixelation) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[320px] bg-gradient-to-b from-primary/10 via-tertiary/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center pt-8 space-y-3.5 relative z-10"
      >
        {/* Authentic Monofolio Logo Frame (from picture) */}
        <div className="relative transform hover:scale-105 transition-transform duration-300">
          <MonofolioLogo variant="framed" width={72} height={83} />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
            Monofolio
          </h1>
          <p className="text-xs text-on-surface-variant font-medium max-w-xs mx-auto leading-relaxed">
            Private Academic Vault, Syllabus Manager & Blunt AI Study Coach
          </p>
        </div>

        {/* Feature Pills (No Emojis - Vector Icons Only) */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="px-3 py-1 rounded-full bg-surface-container-high text-[11px] font-semibold text-on-surface-variant flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>End-to-End Private</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-surface-container-high text-[11px] font-semibold text-on-surface-variant flex items-center gap-1.5 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span>Groq Llama 3.3</span>
          </div>
        </div>
      </motion.div>

      {/* Main Authentication Container (No Boxy White Borders) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-auto my-auto p-6 rounded-[36px] bg-surface-container shadow-2xl relative z-10 space-y-4"
      >
        {/* Google Sign-In Action */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full py-3.5 px-4 rounded-full bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-3 shadow-sm active:scale-98 transition-all cursor-pointer"
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

        {/* Minimal Sub-Divider */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex-1 h-px bg-surface-container-highest" />
          <span className="text-[10px] font-bold text-on-surface-variant font-mono uppercase tracking-widest">
            or with email
          </span>
          <div className="flex-1 h-px bg-surface-container-highest" />
        </div>

        {/* Sign In vs Sign Up Segmented Switcher */}
        <div className="flex p-1 rounded-full bg-surface-container-highest">
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

        {/* Form Inputs */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant font-mono px-1 tracking-wider uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full bg-surface-container-highest text-on-surface rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant font-mono px-1 tracking-wider uppercase">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                className="w-full bg-surface-container-highest text-on-surface rounded-2xl pl-11 pr-11 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
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
                className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2"
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
                className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            className="w-full py-3.5 px-4 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50"
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

          {/* 1-Tap Direct Offline Vault Access (Zero Login Friction) */}
          <button
            type="button"
            onClick={signInAsGuest}
            className="w-full py-2.5 px-4 rounded-full bg-surface-container-highest/80 hover:bg-surface-container-highest text-on-surface-variant font-bold text-[11px] flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer border border-outline-variant/30 mt-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Open Offline Vault (Direct 1-Tap Access)</span>
          </button>
        </form>
      </motion.div>

      {/* Footer Note */}
      <div className="text-center text-[10px] text-on-surface-variant/60 font-mono py-2">
        Monofolio v2.0 &bull; Supabase PostgreSQL
      </div>
    </div>
  );
};
