import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, KeyRound, AlertCircle, Loader2,
  ChevronRight, Copy, Check, ArrowLeft,
  CheckCircle2, Eye, EyeOff, LayoutDashboard
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
});

export default function Carate() {
  const navigate = useNavigate();

  // step 1 = form | step 2 = success (key shown)
  const [step, setStep]       = useState(1);
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [newKey, setNewKey]   = useState(null); // generated key object
  const [copied, setCopied]   = useState(false);
  const [revealed, setRevealed] = useState(false);

  // ── Submit ──────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/keys/generate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (res.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error(data.detail || data.error || 'Failed to create key');

      setNewKey(data);
      setStep(2);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Copy key ────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!newKey?.key) return;
    try {
      await navigator.clipboard.writeText(newKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Copy failed — please select and copy manually.');
    }
  };

  // ── Suggestions ─────────────────────────────────────────────────
  const suggestions = ['Production', 'Development', 'Testing', 'Mobile App', 'Web App'];

  // ── UI ──────────────────────────────────────────────────────────
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
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
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
              <KeyRound className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Guard<span className="text-emerald-400">Net</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1 ? 'Create a new API key' : 'Key generated — save it now'}
            </p>
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Name form ── */}
            {step === 1 && (
              <motion.form
                key="s1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCreate}
                className="space-y-5"
              >
                {/* Info banner */}
                <div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-xs text-gray-500 leading-relaxed">
                  API keys allow you to authenticate requests to GuardNet. You can have up to{' '}
                  <span className="text-emerald-400 font-semibold">5 active keys</span> per account.
                </div>

                {/* Key name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Key Name
                  </label>
                  <div className="relative group">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => { setName(e.target.value); setError(''); }}
                      required
                      minLength={1}
                      maxLength={50}
                      placeholder="e.g. Production, Mobile App..."
                      autoFocus
                      className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-gray-600">A label to identify where this key is used</p>
                    <span className={`text-[11px] font-mono ${name.length > 45 ? 'text-orange-400' : 'text-gray-600'}`}>
                      {name.length}/50
                    </span>
                  </div>
                </div>

                {/* Quick suggestions */}
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-600 uppercase tracking-wider font-semibold">Quick select</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setName(s); setError(''); }}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          name === s
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                            : 'border-white/10 bg-white/5 text-gray-500 hover:text-gray-300 hover:border-white/20'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && <ErrorBox msg={error} />}
                </AnimatePresence>

                {/* Buttons */}
                <div className="space-y-3 pt-1">
                  <motion.button
                    type="submit"
                    disabled={loading || !name.trim()}
                    whileHover={{ scale: loading || !name.trim() ? 1 : 1.02 }}
                    whileTap={{ scale: loading || !name.trim() ? 1 : 0.98 }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none text-sm"
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating key...</>
                      : <><KeyRound className="w-4 h-4" /> Generate API Key <ChevronRight className="w-4 h-4" /></>
                    }
                  </motion.button>

                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors py-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </Link>
                </div>

              </motion.form>
            )}

            {/* ── STEP 2: Key revealed ── */}
            {step === 2 && newKey && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                {/* Warning banner */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/25 rounded-xl px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300/80 leading-relaxed">
                    <span className="font-bold text-amber-400">Copy this key now.</span> For security reasons,
                    it will <span className="font-semibold">not be shown again</span> after you leave this page.
                  </p>
                </motion.div>

                {/* Key display */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="bg-[#060b10] border border-emerald-500/20 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Key Name</p>
                      <p className="text-white font-semibold text-sm mt-0.5">{newKey.name}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* Key value */}
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-2">API Key</p>
                    <div className="relative">
                      <div className="bg-black/40 border border-white/8 rounded-lg px-3 py-2.5 pr-20 overflow-hidden">
                        <code className={`text-xs font-mono break-all leading-relaxed transition-all select-all ${
                          revealed ? 'text-emerald-300' : 'text-transparent'
                        }`}
                          style={revealed ? {} : { textShadow: '0 0 8px rgba(52,211,153,0.5)' }}
                        >
                          {revealed ? newKey.key : newKey.key.replace(/./g, '•')}
                        </code>
                      </div>
                      {/* Actions */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          onClick={() => setRevealed(!revealed)}
                          title={revealed ? 'Hide' : 'Reveal'}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-all"
                        >
                          {revealed
                            ? <EyeOff className="w-3.5 h-3.5" />
                            : <Eye className="w-3.5 h-3.5" />
                          }
                        </button>
                        <button
                          onClick={handleCopy}
                          title="Copy key"
                          className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                            copied
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-gray-500 hover:text-emerald-400 hover:bg-white/10'
                          }`}
                        >
                          {copied
                            ? <Check className="w-3.5 h-3.5" />
                            : <Copy className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Copy CTA button */}
                <motion.button
                  onClick={handleCopy}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm ${
                    copied
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                      : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  }`}
                >
                  {copied
                    ? <><CheckCircle2 className="w-4 h-4" /> Copied to clipboard!</>
                    : <><Copy className="w-4 h-4" /> Copy API Key</>
                  }
                </motion.button>

                {/* Error */}
                <AnimatePresence>
                  {error && <ErrorBox msg={error} />}
                </AnimatePresence>

                {/* Go to dashboard */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/15 text-gray-300 text-sm font-medium py-3 rounded-xl transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
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

// ── Reusable error box ──────────────────────────────────────────────
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
