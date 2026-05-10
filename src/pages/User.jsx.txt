import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, User, Mail, Lock, Eye, EyeOff, AlertCircle,
  Loader2, CheckCircle2, ArrowLeft, Trash2, LogOut,
  ShieldCheck, KeyRound, Calendar, ChevronRight,
  LayoutDashboard, Github, Chrome
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
});

export default function UserProfile() {
  const navigate = useNavigate();

  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);

  // Email update
  const [newEmail, setNewEmail]   = useState('');
  const [emailLoading, setEmailL] = useState(false);
  const [emailMsg, setEmailMsg]   = useState(null); // { type, text }

  // Password update
  const [passForm, setPassForm]   = useState({ password: '', confirm: '' });
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [passLoading, setPassL]   = useState(false);
  const [passMsg, setPassMsg]     = useState(null);

  // Delete account
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteC]   = useState('');
  const [deleteLoading, setDeleteL]   = useState(false);
  const [deleteError, setDeleteErr]   = useState('');

  // ── Fetch profile ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/user/profile`, { headers: authHeaders() });
        if (res.status === 401) { localStorage.clear(); navigate('/login'); return; }
        const data = await res.json();
        setProfile(data);
        setNewEmail(data.email);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // ── Password strength ─────────────────────────────────────────
  const getStrength = (p) => {
    if (!p) return { level: 0, label: '', color: '' };
    let s = 0;
    if (p.length >= 8)          s++;
    if (/[A-Z]/.test(p))        s++;
    if (/[0-9]/.test(p))        s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return [
      { level: 1, label: 'Weak',   color: 'bg-red-500' },
      { level: 2, label: 'Fair',   color: 'bg-orange-500' },
      { level: 3, label: 'Good',   color: 'bg-yellow-500' },
      { level: 4, label: 'Strong', color: 'bg-emerald-500' },
    ][s - 1] || { level: 0, label: '', color: '' };
  };
  const strength = getStrength(passForm.password);

  // ── Update email ──────────────────────────────────────────────
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    if (newEmail === profile?.email) {
      setEmailMsg({ type: 'error', text: 'This is already your current email.' });
      return;
    }
    setEmailL(true);
    setEmailMsg(null);
    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Update failed');
      setProfile(prev => ({ ...prev, email: newEmail }));
      setEmailMsg({ type: 'success', text: 'Email updated successfully.' });
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.message });
    } finally {
      setEmailL(false);
    }
  };

  // ── Update password ───────────────────────────────────────────
  const handlePassUpdate = async (e) => {
    e.preventDefault();
    if (passForm.password.length < 8) {
      setPassMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (passForm.password !== passForm.confirm) {
      setPassMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setPassL(true);
    setPassMsg(null);
    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ password: passForm.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Update failed');
      setPassForm({ password: '', confirm: '' });
      setPassMsg({ type: 'success', text: 'Password changed successfully.' });
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message });
    } finally {
      setPassL(false);
    }
  };

  // ── Delete account ────────────────────────────────────────────
  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') {
      setDeleteErr('Type DELETE to confirm.');
      return;
    }
    setDeleteL(true);
    setDeleteErr('');
    try {
      const res = await fetch(`${API_BASE}/user/account`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Delete failed');
      }
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      setDeleteErr(err.message);
    } finally {
      setDeleteL(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: authHeaders() });
    } catch { /* ignore */ }
    localStorage.clear();
    navigate('/login');
  };

  // ── Format date ───────────────────────────────────────────────
  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';

  const providerIcon = (p) => {
    if (p === 'google') return <Chrome className="w-3.5 h-3.5" />;
    if (p === 'github') return <Github className="w-3.5 h-3.5" />;
    return <Shield className="w-3.5 h-3.5" />;
  };

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full relative px-4 py-12">

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
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto space-y-5">

        {/* ── Top nav ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-600 hover:text-red-400 text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        {/* ── Profile card ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 rounded-2xl blur-lg" />
          <div className="relative bg-[#0A1118] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-base truncate">{profile?.email}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {/* Verified badge */}
                  <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    profile?.is_verified
                      ? 'text-emerald-400 bg-emerald-400/10'
                      : 'text-orange-400 bg-orange-400/10'
                  }`}>
                    {profile?.is_verified
                      ? <><CheckCircle2 className="w-3 h-3" /> Verified</>
                      : <><AlertCircle className="w-3 h-3" /> Unverified</>
                    }
                  </span>
                  {/* Provider badge */}
                  <span className="flex items-center gap-1 text-[11px] text-gray-500 capitalize">
                    {providerIcon(profile?.auth_provider)} {profile?.auth_provider}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs text-gray-600">
              <Calendar className="w-3.5 h-3.5" />
              Member since {formatDate(profile?.created_at)}
            </div>
          </div>
        </motion.div>

        {/* ── Update Email ──────────────────────────────────────── */}
        <Section title="Email Address" icon={Mail} delay={0.1}>
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                New Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => { setNewEmail(e.target.value); setEmailMsg(null); }}
                  required
                  placeholder="you@gmail.com"
                  disabled={profile?.auth_provider !== 'email'}
                  className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
              {profile?.auth_provider !== 'email' && (
                <p className="text-[11px] text-gray-600 flex items-center gap-1">
                  {providerIcon(profile?.auth_provider)}
                  Email is managed by your {profile?.auth_provider} account
                </p>
              )}
            </div>

            <AnimatePresence>
              {emailMsg && <FeedbackMsg type={emailMsg.type} text={emailMsg.text} />}
            </AnimatePresence>

            {profile?.auth_provider === 'email' && (
              <SubmitButton
                loading={emailLoading}
                disabled={!newEmail.trim() || newEmail === profile?.email}
                label="Update Email"
                loadingLabel="Updating..."
              />
            )}
          </form>
        </Section>

        {/* ── Change Password ───────────────────────────────────── */}
        {profile?.auth_provider === 'email' && (
          <Section title="Change Password" icon={Lock} delay={0.2}>
            <form onSubmit={handlePassUpdate} className="space-y-4">

              {/* New password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={passForm.password}
                    onChange={e => { setPassForm(p => ({ ...p, password: e.target.value })); setPassMsg(null); }}
                    placeholder="Min 8 characters"
                    className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 text-white placeholder-gray-600 rounded-xl pl-10 pr-11 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passForm.password && (
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

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type={showConf ? 'text' : 'password'}
                    value={passForm.confirm}
                    onChange={e => { setPassForm(p => ({ ...p, confirm: e.target.value })); setPassMsg(null); }}
                    placeholder="Re-enter password"
                    className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl pl-10 pr-11 py-3 text-sm outline-none transition-all focus:ring-2 ${
                      passForm.confirm && passForm.confirm !== passForm.password
                        ? 'border-red-500/50 focus:ring-red-500/20'
                        : 'border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConf(!showConf)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passForm.confirm && passForm.confirm !== passForm.password && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Passwords don't match
                  </p>
                )}
              </div>

              <AnimatePresence>
                {passMsg && <FeedbackMsg type={passMsg.type} text={passMsg.text} />}
              </AnimatePresence>

              <SubmitButton
                loading={passLoading}
                disabled={!passForm.password || !passForm.confirm}
                label="Change Password"
                loadingLabel="Updating..."
              />
            </form>
          </Section>
        )}

        {/* ── Quick Links ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          <Link to="/dashboard"
            className="flex items-center gap-2.5 bg-[#0A1118] border border-white/10 hover:border-white/15 rounded-xl px-4 py-3.5 text-sm text-gray-400 hover:text-white transition-all group"
          >
            <LayoutDashboard className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-700 group-hover:text-gray-500 transition-colors" />
          </Link>
          <Link to="/create-key"
            className="flex items-center gap-2.5 bg-[#0A1118] border border-white/10 hover:border-white/15 rounded-xl px-4 py-3.5 text-sm text-gray-400 hover:text-white transition-all group"
          >
            <KeyRound className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
            <span>Create Key</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-700 group-hover:text-gray-500 transition-colors" />
          </Link>
        </motion.div>

        {/* ── Danger Zone ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="bg-[#0A1118] border border-red-500/15 rounded-2xl p-6"
        >
          <h3 className="text-sm font-bold text-red-400 mb-1 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Danger Zone
          </h3>
          <p className="text-xs text-gray-600 mb-4 leading-relaxed">
            Permanently delete your account, all API keys, and usage history. This action cannot be undone.
          </p>
          <button
            onClick={() => { setDeleteModal(true); setDeleteC(''); setDeleteErr(''); }}
            className="flex items-center gap-2 text-xs font-semibold text-red-400/70 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 hover:border-red-500/25 px-4 py-2.5 rounded-xl transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Account
          </button>
        </motion.div>

      </div>

      {/* ── Delete Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', bounce: 0.3 }}
                className="relative w-full max-w-sm"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-lg" />
                <div className="relative bg-[#0A1118] border border-red-500/20 rounded-2xl p-6 shadow-2xl">

                  {/* Icon */}
                  <div className="flex flex-col items-center mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
                      <Trash2 className="w-7 h-7 text-red-400" />
                    </div>
                    <h2 className="text-white font-black text-lg">Delete Account?</h2>
                    <p className="text-gray-500 text-xs text-center mt-1.5 leading-relaxed">
                      All your API keys and data will be permanently removed.
                    </p>
                  </div>

                  {/* Confirm input */}
                  <div className="space-y-2 mb-4">
                    <label className="text-xs text-gray-500 block text-center">
                      Type <span className="text-red-400 font-bold font-mono">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={e => { setDeleteC(e.target.value); setDeleteErr(''); }}
                      placeholder="DELETE"
                      autoFocus
                      className="w-full bg-white/5 border border-red-500/20 focus:border-red-500/50 text-white placeholder-gray-700 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-red-500/20 text-center font-mono tracking-widest"
                    />
                  </div>

                  <AnimatePresence>
                    {deleteError && (
                      <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-xs text-red-400 text-center mb-3 flex items-center justify-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" /> {deleteError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <motion.button
                      onClick={handleDelete}
                      disabled={deleteLoading || deleteConfirm !== 'DELETE'}
                      whileHover={{ scale: deleteLoading ? 1 : 1.02 }}
                      whileTap={{ scale: deleteLoading ? 1 : 0.98 }}
                      className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                    >
                      {deleteLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                        : <><Trash2 className="w-4 h-4" /> Delete My Account</>
                      }
                    </motion.button>
                    <button
                      onClick={() => setDeleteModal(false)}
                      className="w-full py-2.5 rounded-xl text-gray-500 hover:text-gray-300 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function Section({ title, icon: Icon, delay, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-[#0A1118] border border-white/10 rounded-2xl p-6"
    >
      <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-emerald-400" />
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function FeedbackMsg({ type, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm ${
        type === 'success'
          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/10 border border-red-500/20 text-red-400'
      }`}
    >
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />
      }
      <span>{text}</span>
    </motion.div>
  );
}

function SubmitButton({ loading, disabled, label, loadingLabel }) {
  return (
    <motion.button
      type="submit"
      disabled={loading || disabled}
      whileHover={{ scale: loading || disabled ? 1 : 1.02 }}
      whileTap={{ scale: loading || disabled ? 1 : 0.98 }}
      className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] disabled:shadow-none text-sm"
    >
      {loading
        ? <><Loader2 className="w-4 h-4 animate-spin" /> {loadingLabel}</>
        : <><ShieldCheck className="w-4 h-4" /> {label} <ChevronRight className="w-4 h-4" /></>
      }
    </motion.button>
  );
}
