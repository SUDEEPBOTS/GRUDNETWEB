import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LayoutDashboard, KeyRound, User, LogOut,
  BarChart3, Activity, Zap, Copy, Trash2, EyeOff,
  CheckCircle2, AlertCircle, Loader2, RefreshCw,
  TrendingUp, Clock, Plus, ChevronRight, Menu, X,
  Power, Check, FlaskConical
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Auth helper ────────────────────────────────────────────────────
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
});

export default function Dashboard() {
  const navigate = useNavigate();

  // State
  const [profile, setProfile]       = useState(null);
  const [usage, setUsage]           = useState(null);
  const [keys, setKeys]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [sidebarOpen, setSidebar]   = useState(false);
  const [copiedId, setCopiedId]     = useState(null);
  const [actionLoading, setAction]  = useState(null); // key id during delete/disable
  const [toast, setToast]           = useState(null);

  // ── Fetch all data ─────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, usageRes, keysRes] = await Promise.all([
        fetch(`${API_BASE}/user/profile`,  { headers: authHeaders() }),
        fetch(`${API_BASE}/user/usage`,    { headers: authHeaders() }),
        fetch(`${API_BASE}/keys/list`,     { headers: authHeaders() }),
      ]);

      // 401 → logout
      if (profileRes.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const [p, u, k] = await Promise.all([
        profileRes.json(),
        usageRes.json(),
        keysRes.json(),
      ]);

      setProfile(p);
      setUsage(u);
      setKeys(k.keys || []);
    } catch {
      setError('Failed to load data. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Toast helper ───────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Copy key ──────────────────────────────────────────────────
  const handleCopy = async (key, id) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Copy failed', 'error');
    }
  };

  // ── Delete key ────────────────────────────────────────────────
  const handleDelete = async (keyId) => {
    if (!confirm('Delete this API key? This cannot be undone.')) return;
    setAction(keyId + '_delete');
    try {
      const res = await fetch(`${API_BASE}/keys/${keyId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setKeys(prev => prev.filter(k => k.id !== keyId));
      showToast('Key deleted successfully');
    } catch {
      showToast('Failed to delete key', 'error');
    } finally {
      setAction(null);
    }
  };

  // ── Disable key ───────────────────────────────────────────────
  const handleDisable = async (keyId) => {
    setAction(keyId + '_disable');
    try {
      const res = await fetch(`${API_BASE}/keys/${keyId}/disable`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setKeys(prev =>
        prev.map(k => k.id === keyId ? { ...k, is_active: false } : k)
      );
      showToast('Key disabled');
    } catch {
      showToast('Failed to disable key', 'error');
    } finally {
      setAction(null);
    }
  };

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: authHeaders(),
      });
    } catch { /* ignore */ }
    localStorage.clear();
    navigate('/login');
  };

  // ── Helpers ───────────────────────────────────────────────────
  const maskKey = (key) => key?.slice(0, 16) + '••••••••••••';

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const getEndpointLabel = (endpoint) => {
    if (endpoint?.includes('image')) return { label: 'Image', color: 'text-cyan-400 bg-cyan-400/10' };
    if (endpoint?.includes('abuse')) return { label: 'Abuse', color: 'text-orange-400 bg-orange-400/10' };
    return { label: 'Other', color: 'text-gray-400 bg-white/5' };
  };

  // ── Animation variants ────────────────────────────────────────
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' }
    }),
  };

  // ═══════════════════════════════════════════════════════════════
  //  LOADING STATE
  // ═══════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  MAIN UI
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen w-full bg-[#050A0F] flex">

      {/* ── Grid Background ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,136,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,255,136,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-emerald-500/4 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/4 rounded-full blur-[140px]" />
      </div>

      {/* ── Mobile Sidebar Overlay ───────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebar(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className="fixed top-0 left-0 h-full w-64 z-40 lg:relative lg:translate-x-0 lg:flex flex-col"
        style={{ display: 'flex' }}
      >
        <div className="h-full bg-[#080D13] border-r border-white/[0.06] flex flex-col">

          {/* Logo */}
          <div className="p-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/25 to-cyan-500/25 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4.5 h-4.5 text-emerald-400" style={{ width: 18, height: 18 }} />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Guard<span className="text-emerald-400">Net</span>
              </span>
            </div>
            {profile && (
              <p className="text-xs text-gray-600 mt-3 truncate font-mono">
                {profile.email}
              </p>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active />
            <NavItem to="/playground" icon={FlaskConical} label="Playground" />
            <NavItem to="/create-key" icon={Plus} label="Create Key" />
            <NavItem to="/user" icon={User} label="Profile" />
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/[0.06]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-medium group"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 min-w-0 relative z-10">

        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-[#050A0F]/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebar(true)}
                className="lg:hidden text-gray-500 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-white font-bold text-lg leading-none">Dashboard</h1>
                <p className="text-gray-600 text-xs mt-0.5">Overview & API Keys</p>
              </div>
            </div>
            <button
              onClick={fetchAll}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-500/5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

          {/* ── Error ────────────────────────────────────────── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Stats Grid ───────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={Activity}
              label="Total Requests"
              value={usage?.total_requests ?? 0}
              sub="All time"
              color="emerald"
              delay={0}
            />
            <StatCard
              icon={TrendingUp}
              label="Today's Requests"
              value={usage?.today_requests ?? 0}
              sub="Last 24 hours"
              color="cyan"
              delay={1}
            />
            <StatCard
              icon={KeyRound}
              label="Active Keys"
              value={`${usage?.active_keys ?? 0} / ${usage?.total_keys ?? 0}`}
              sub="Key usage"
              color="violet"
              delay={2}
            />
          </div>

          {/* ── API Keys Section ─────────────────────────────── */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-bold text-base">API Keys</h2>
                <p className="text-gray-600 text-xs mt-0.5">Max 5 active keys per account</p>
              </div>
              <Link
                to="/create-key"
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-[0_0_16px_rgba(16,185,129,0.2)]"
              >
                <Plus className="w-3.5 h-3.5" /> New Key
              </Link>
            </div>

            {keys.length === 0 ? (
              <EmptyKeys />
            ) : (
              <div className="space-y-3">
                {keys.map((key, i) => (
                  <motion.div
                    key={key.id}
                    variants={fadeUp} initial="hidden" animate="visible" custom={3 + i * 0.5}
                    className={`relative bg-[#0A1118] border rounded-2xl p-5 transition-all ${
                      key.is_active
                        ? 'border-white/10 hover:border-white/15'
                        : 'border-white/5 opacity-60'
                    }`}
                  >
                    {/* Status dot */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          key.is_active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-gray-600'
                        }`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-semibold text-sm">{key.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              key.is_active
                                ? 'text-emerald-400 bg-emerald-400/10'
                                : 'text-gray-500 bg-white/5'
                            }`}>
                              {key.is_active ? 'ACTIVE' : 'DISABLED'}
                            </span>
                          </div>
                          {/* Key value */}
                          <div className="mt-2 flex items-center gap-2">
                            <code className="text-xs font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg truncate max-w-[220px]">
                              {maskKey(key.key)}
                            </code>
                            <button
                              onClick={() => handleCopy(key.key, key.id)}
                              className="text-gray-600 hover:text-emerald-400 transition-colors flex-shrink-0"
                              title="Copy key"
                            >
                              {copiedId === key.id
                                ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                                : <Copy className="w-3.5 h-3.5" />
                              }
                            </button>
                          </div>
                          {/* Dates */}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-[11px] text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Created {formatDate(key.created_at)}
                            </span>
                            {key.last_used && (
                              <span className="text-[11px] text-gray-600 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Used {formatDate(key.last_used)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {key.is_active && (
                          <ActionBtn
                            icon={Power}
                            label="Disable"
                            color="orange"
                            loading={actionLoading === key.id + '_disable'}
                            onClick={() => handleDisable(key.id)}
                          />
                        )}
                        <ActionBtn
                          icon={Trash2}
                          label="Delete"
                          color="red"
                          loading={actionLoading === key.id + '_delete'}
                          onClick={() => handleDelete(key.id)}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Endpoint Breakdown ───────────────────────────── */}
          {usage?.endpoint_breakdown?.length > 0 && (
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={5}
            >
              <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" /> Endpoint Usage
              </h2>
              <div className="bg-[#0A1118] border border-white/10 rounded-2xl overflow-hidden">
                {usage.endpoint_breakdown.map((item, i) => {
                  const tag = getEndpointLabel(item.endpoint);
                  const maxCount = usage.endpoint_breakdown[0]?.count || 1;
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-4 px-5 py-3.5 ${
                        i !== usage.endpoint_breakdown.length - 1 ? 'border-b border-white/5' : ''
                      }`}
                    >
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${tag.color}`}>
                        {tag.label}
                      </span>
                      <code className="text-xs text-gray-400 font-mono truncate flex-1 min-w-0">
                        {item.endpoint}
                      </code>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white w-12 text-right">
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </div>
      </main>

      {/* ── Toast ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl ${
              toast.type === 'error'
                ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
            }`}
          >
            {toast.type === 'error'
              ? <AlertCircle className="w-4 h-4" />
              : <CheckCircle2 className="w-4 h-4" />
            }
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function NavItem({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'text-gray-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {active && <ChevronRight className="w-3 h-3 ml-auto" />}
    </Link>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, delay }) {
  const colors = {
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-400',
      glow: 'bg-emerald-500/5',
    },
    cyan: {
      bg: 'from-cyan-500/10 to-cyan-500/5',
      border: 'border-cyan-500/20',
      icon: 'text-cyan-400',
      glow: 'bg-cyan-500/5',
    },
    violet: {
      bg: 'from-violet-500/10 to-violet-500/5',
      border: 'border-violet-500/20',
      icon: 'text-violet-400',
      glow: 'bg-violet-500/5',
    },
  };
  const c = colors[color];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { delay: delay * 0.08, duration: 0.4, ease: 'easeOut' } }
      }}
      initial="hidden"
      animate="visible"
      className={`relative bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5 overflow-hidden`}
    >
      <div className={`absolute -right-4 -top-4 w-20 h-20 ${c.glow} rounded-full blur-2xl`} />
      <div className="relative">
        <div className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        <p className="text-2xl font-black text-white leading-none">{value}</p>
        <p className="text-xs font-semibold text-white/70 mt-1">{label}</p>
        <p className="text-[11px] text-gray-600 mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
}

function ActionBtn({ icon: Icon, label, color, loading, onClick }) {
  const colors = {
    orange: 'text-gray-600 hover:text-orange-400 hover:bg-orange-500/10',
    red:    'text-gray-600 hover:text-red-400 hover:bg-red-500/10',
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${colors[color]} disabled:opacity-50`}
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <Icon className="w-3.5 h-3.5" />
      }
    </button>
  );
}

function EmptyKeys() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-[#0A1118] border border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mb-4">
        <KeyRound className="w-6 h-6 text-emerald-400/50" />
      </div>
      <p className="text-white font-semibold text-sm">No API keys yet</p>
      <p className="text-gray-600 text-xs mt-1 mb-5">Create your first key to start using the API</p>
      <Link
        to="/create-key"
        className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_16px_rgba(16,185,129,0.2)]"
      >
        <Plus className="w-3.5 h-3.5" /> Create Key
      </Link>
    </motion.div>
  );
}
