import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Mail, Lock, Eye, EyeOff, AlertCircle,
  Loader2, ChevronRight, CheckCircle2, RefreshCw,
  ArrowLeft, KeyRound, ShieldCheck
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Forgate() {
  const navigate = useNavigate();

  // step 1 = email | step 2 = otp+newpass | step 3 = success
  const [step, setStep] = useState(1);

  // Step 1
  const [email, setEmail]       = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError]       = useState('');

  // Step 2 — OTP
  const [otp, setOtp]               = useState(['', '', '', '', '', '']);
  const [newPass, setNewPass]       = useState('');
  const [confirmPass, setConfirm]   = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [verifyLoading, setVerify]  = useState(false);
  const [resendLoading, setResend]  = useState(false);
  const [resendTimer, setTimer]     = useState(0);
  const otpRefs = useRef([]);

  // ── Password strength ──────────────────────────────────────────
  const getStrength = (pass) => {
    if (!pass) return { level: 0, label: '', color: '' };
    let s = 0;
    if (pass.length >= 8)          s++;
    if (/[A-Z]/.test(pass))        s++;
    if (/[0-9]/.test(pass))        s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return [
      { level: 1, label: 'Weak',   color: 'bg-red-500' },
      { level: 2, label: 'Fair',   color: 'bg-orange-500' },
      { level: 3, label: 'Good',   color: 'bg-yellow-500' },
      { level: 4, label: 'Strong', color: 'bg-emerald-500' },
    ][s - 1] || { level: 0, label: '', color: '' };
  };
  const strength = getStrength(newPass);

  // ── Resend timer ───────────────────────────────────────────────
  const startTimer = () => {
    setTimer(60);
    const id = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── OTP handlers ───────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (error) setError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  // ── Step 1: Send OTP ───────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Failed to send code');
      setStep(2);
      startTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResend(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to resend');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      startTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setResend(false);
    }
  };

  // ── Step 2: Verify OTP + Reset Password ───────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { setError('Enter the complete 6-digit code.'); return; }
    if (newPass.length < 8)  { setError('Password must be at least 8 characters.'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }

    setVerify(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpStr, new_password: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Reset failed');
      setStep(3);
    } catch (err) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setVerify(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────
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
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
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
              {step === 1 && 'Reset your password'}
              {step === 2 && 'Enter verification code'}
              {step === 3 && 'Password updated'}
            </p>
          </div>

          {/* Step indicator */}
          {step < 3 && (
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />
              <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-emerald-500' : 'bg-white/10'}`} />
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Email ── */}
            {step === 1 && (
              <motion.form
                key="s1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <p className="text-sm text-gray-400 text-center leading-relaxed">
                  Enter your registered email and we'll send a verification code to reset your password.
                </p>

                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      required
                      placeholder="you@gmail.com"
                      className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && <ErrorBox msg={error} />}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={emailLoading || !email.trim()}
                  whileHover={{ scale: emailLoading ? 1 : 1.02 }}
                  whileTap={{ scale: emailLoading ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none text-sm"
                >
                  {emailLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending code...</>
                    : <><Mail className="w-4 h-4" /> Send Verification Code <ChevronRight className="w-4 h-4" /></>
                  }
                </motion.button>

                <p className="text-center text-gray-500 text-sm">
                  Remember your password?{' '}
                  <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </motion.form>
            )}

            {/* ── STEP 2: OTP + New Password ── */}
            {step === 2 && (
              <motion.form
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleReset}
                className="space-y-5"
              >
                {/* Email badge */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-300 text-center">
                  Code sent to <span className="font-bold">{email}</span>
                </div>

                {/* OTP boxes */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3 text-center">
                    6-digit verification code
                  </label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-11 h-12 text-center text-white text-lg font-bold bg-white/5 border border-white/10 focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20 rounded-xl outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={newPass}
                      onChange={e => { setNewPass(e.target.value); setError(''); }}
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
                  {/* Strength bar */}
                  {newPass && (
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
                      }`}>{strength.label}</p>
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
                      value={confirmPass}
                      onChange={e => { setConfirm(e.target.value); setError(''); }}
                      required
                      placeholder="Re-enter password"
                      className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl pl-10 pr-11 py-3 text-sm outline-none transition-all focus:ring-2 ${
                        confirmPass && confirmPass !== newPass
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
                  {confirmPass && confirmPass !== newPass && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Passwords don't match
                    </p>
                  )}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && <ErrorBox msg={error} />}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={verifyLoading || otp.join('').length !== 6}
                  whileHover={{ scale: verifyLoading ? 1 : 1.02 }}
                  whileTap={{ scale: verifyLoading ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none text-sm"
                >
                  {verifyLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</>
                    : <><ShieldCheck className="w-4 h-4" /> Reset Password <ChevronRight className="w-4 h-4" /></>
                  }
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
                        : <><RefreshCw className="w-3 h-3" /> Resend code</>
                    }
                  </button>
                </div>

              </motion.form>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-5 py-2"
              >
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </motion.div>

                <div>
                  <h2 className="text-xl font-black text-white">Password Reset!</h2>
                  <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                    Your password has been updated successfully.<br />
                    You can now sign in with your new password.
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Link
                    to="/login"
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] text-sm"
                  >
                    <ShieldCheck className="w-4 h-4" /> Go to Login
                  </Link>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ── Reusable error box ─────────────────────────────────────────────
function ErrorBox({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm"
    >
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{msg}</span>
    </motion.div>
  );
}
