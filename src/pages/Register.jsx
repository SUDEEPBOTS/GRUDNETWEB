import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Turnstile } from '@marsidev/react-turnstile';
import {
  Shield, Mail, Lock, Eye, EyeOff, AlertCircle,
  Loader2, ChevronRight, ShieldCheck, KeyRound,
  CheckCircle2, RefreshCw, ArrowLeft
} from 'lucide-react';

const API_BASE    = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CF_SITE_KEY = '0x4AAAAAADMnkzocWpBzgqah';

// ── Gmail only check ───────────────────────────────────────────────
const isGmail = (email) => email.trim().toLowerCase().endsWith('@gmail.com');

export default function Register() {
  const navigate     = useNavigate();
  const turnstileRef = useRef(null);

  // Step 1: form | Step 2: otp
  const [step, setStep] = useState(1);

  // Form state
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [terms, setTerms]               = useState(false);
  const [cfToken, setCfToken]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  // OTP state
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer]     = useState(0);
  const otpRefs = useRef([]);

  // ── Handlers ──────────────────────────────────────────────────

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  // Step 1 — Register karo, OTP bhejo
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isGmail(form.email)) {
      setError('Only @gmail.com email addresses are allowed.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!terms) {
      setError('Please accept the Terms & Conditions.');
      return;
    }
    if (!cfToken) {
      setError('Please complete the verification.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    form.email,
          password: form.password,
          cf_token: cfToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Registration failed');

      // OTP step pe jao
      setStep(2);
      startResendTimer();

    } catch (err) {
      setError(err.message);
      turnstileRef.current?.reset();
      setCfToken('');
    } finally {
      setLoading(false);
    }
  };

  // OTP input handle
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // sirf numbers
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // ek hi digit
    setOtp(newOtp);
    if (error) setError('');

    // Auto focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 2 — OTP verify karo
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: otpString }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Invalid OTP');

      localStorage.setItem('access_token',  data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to resend OTP');
      startResendTimer();
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  // 60 second resend cooldown
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Password strength
  const getStrength = (pass) => {
    if (!pass) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8)  score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    const map = [
      { level: 1, label: 'Weak',   color: 'bg-red-500' },
      { level: 2, label: 'Fair',   color: 'bg-orange-500' },
      { level: 3, label: 'Good',   color: 'bg-yellow-500' },
      { level: 4, label: 'Strong', color: 'bg-emerald-500' },
    ];
    return map[score - 1] || { level: 0, label: '', color: '' };
  };

  const strength = getStrength(form.password);

  // ── UI ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative px-4 py-12">

      {/* Background */}
      <div className="absolute inset-0 bg-[#050A0F]">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,136,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,255,136,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className="relative w-full max-w-md z-10"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-xl" />

        <div className="relative bg-[#0A1118] border border-white/10 rounded-2xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center mb-3">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Guard<span className="text-emerald-400">Net</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1 ? 'Create your account' : 'Verify your email'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-1 rounded-full transition-all ${step >= 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />
            <div className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? 'bg-emerald-500' : 'bg-white/10'}`} />
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Register Form ── */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@gmail.com"
                      className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  {/* Gmail only hint */}
                  {form.email && !isGmail(form.email) && (
                    <motion.p
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-xs text-red-400 flex items-center gap-1 mt-1"
                    >
                      <AlertCircle className="w-3 h-3" /> Only @gmail.com is allowed
                    </motion.p>
                  )}
                  {form.email && isGmail(form.email) && (
                    <motion.p
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-xs text-emerald-400 flex items-center gap-1 mt-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Valid email
                    </motion.p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Min 8 characters"
                      className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 text-white placeholder-gray-600 rounded-xl pl-10 pr-11 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {form.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i}
                            className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-white/10'}`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${
                        strength.level <= 1 ? 'text-red-400' :
                        strength.level === 2 ? 'text-orange-400' :
                        strength.level === 3 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirm"
                      value={form.confirm}
                      onChange={handleChange}
                      required
                      placeholder="Re-enter password"
                      className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl pl-10 pr-11 py-3 text-sm outline-none transition-all focus:ring-2
                        ${form.confirm && form.confirm !== form.password
                          ? 'border-red-500/50 focus:ring-red-500/20'
                          : 'border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                        }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirm && form.confirm !== form.password && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Passwords don't match
                    </p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                  <div
                    onClick={() => setTerms(!terms)}
                    className={`w-4 h-4 mt-0.5 rounded border shrink-0 flex items-center justify-center transition-all
                      ${terms
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-white/5 border-white/20 group-hover:border-emerald-500/50'
                      }`}
                  >
                    {terms && (
                      <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 text-white" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 leading-relaxed">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2">
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2">
                      Privacy Policy
                    </a>
                  </span>
                </label>

                {/* Cloudflare Turnstile */}
                <div className="flex justify-center py-1">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={CF_SITE_KEY}
                    onSuccess={(token) => setCfToken(token)}
                    onError={() => { setCfToken(''); setError('Captcha error — please try again.'); }}
                    onExpire={() => setCfToken('')}
                    options={{ theme: 'dark', size: 'normal' }}
                  />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading || !cfToken || !terms}
                  whileHover={{ scale: loading || !cfToken || !terms ? 1 : 1.02 }}
                  whileTap={{ scale: loading || !cfToken || !terms ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none text-sm"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Create Account <ChevronRight className="w-4 h-4" /></>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-gray-600 text-xs">OR</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* OAuth */}
                <div className="grid grid-cols-2 gap-3">
                  <a href={`${API_BASE}/auth/google`}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 rounded-xl py-2.5 text-sm font-medium transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </a>
                  <a href={`${API_BASE}/auth/github`}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 rounded-xl py-2.5 text-sm font-medium transition-all"
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                </div>

                {/* Login Link */}
                <p className="text-center text-gray-500 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>

              </motion.form>
            )}

            {/* ── STEP 2: OTP Verify ── */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-5"
              >
                {/* Info */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-300 text-center">
                  OTP sent to <span className="font-bold">{form.email}</span>
                </div>

                {/* OTP Boxes */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3 text-center">
                    Enter 6-digit verification code
                  </label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => otpRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        className="w-11 h-12 text-center text-white text-lg font-bold bg-white/5 border border-white/10 focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20 rounded-xl outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Verify Button */}
                <motion.button
                  type="submit"
                  disabled={otpLoading || otp.join('').length !== 6}
                  whileHover={{ scale: otpLoading ? 1 : 1.02 }}
                  whileTap={{ scale: otpLoading ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none text-sm"
                >
                  {otpLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Verify & Continue <ChevronRight className="w-4 h-4" /></>
                  )}
                </motion.button>

                {/* Resend + Back */}
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); setOtp(['','','','','','']); }}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors text-xs"
                  >
                    <ArrowLeft className="w-3 h-3" /> Go back
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0 || resendLoading}
                    className="flex items-center gap-1 text-xs text-emerald-400/70 hover:text-emerald-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    {resendLoading
                      ? <><Loader2 className="w-3 h-3 animate-spin" /> Sending...</>
                      : resendTimer > 0
                        ? <><KeyRound className="w-3 h-3" /> Resend in {resendTimer}s</>
                        : <><RefreshCw className="w-3 h-3" /> Resend OTP</>
                    }
                  </button>
                </div>

              </motion.form>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
