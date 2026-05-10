// pages/Playground.jsx

import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LayoutDashboard, KeyRound, User, LogOut,
  Play, ChevronRight, Menu, Plus, Terminal, BookOpen,
  Copy, Check, Loader2, AlertCircle, Image, MessageSquare,
  Cpu, Zap, Clock, Upload, X, ChevronDown, FlaskConical,
  Code2, Globe, Lock
} from 'lucide-react';

const API_BASE = 'https://yukiapi.site';

// ── Endpoint Definitions ────────────────────────────────────────────
const ENDPOINTS = [
  {
    id: 'abuse-check',
    method: 'POST',
    path: '/v2/abuse/check',
    name: 'Abuse Check',
    tag: 'Abuse',
    tagColor: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    description: 'Detect toxic, hateful, or abusive content in text using multiple AI models (Detoxify, Multilingual XLM-RoBERTa, HateSonar).',
    authRequired: true,
    fields: [
      {
        key: 'text', type: 'textarea', label: 'Text',
        placeholder: 'Enter text to analyze for abuse/toxicity...',
        required: true, maxLength: 5000,
        hint: 'Max 5000 characters'
      }
    ],
    exampleRequest: { text: 'You absolute idiot, I hate you so much!' },
    exampleResponse: {
      final_score: 82.4,
      verdict: 'TOXIC',
      threshold_used: 0.6,
      models: {
        detoxify: { score: 91.2, status: 'FAIL', reason: 'High toxicity detected' },
        multilingual: { score: 78.5, status: 'FAIL', reason: 'Hate content' },
        hatesonar: { score: 77.4, status: 'FAIL', reason: 'Abusive language' }
      },
      summary: 'Content flagged as TOXIC by all models.'
    }
  },
  {
    id: 'abuse-custom',
    method: 'POST',
    path: '/v2/abuse/custom',
    name: 'Abuse (Custom)',
    tag: 'Abuse',
    tagColor: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    description: 'Custom threshold abuse detection. Fine-tune sensitivity and filter by specific toxicity categories.',
    authRequired: true,
    fields: [
      {
        key: 'text', type: 'textarea', label: 'Text',
        placeholder: 'Enter text to analyze...', required: true, maxLength: 5000,
        hint: 'Max 5000 characters'
      },
      {
        key: 'threshold', type: 'slider', label: 'Threshold',
        min: 0.01, max: 1.0, step: 0.01, defaultValue: 0.5,
        hint: 'Lower = stricter moderation'
      },
      {
        key: 'categories', type: 'tags', label: 'Categories (optional)',
        placeholder: 'Add category and press Enter...',
        hint: 'e.g. toxic, hate, threat, insult, obscene'
      }
    ],
    exampleRequest: { text: 'Hello there!', threshold: 0.5, categories: ['toxic', 'hate'] },
    exampleResponse: {
      final_score: 2.1,
      verdict: 'CLEAN',
      threshold_used: 0.5,
      models: {
        detoxify: { score: 1.8, status: 'PASS', reason: 'Clean content' },
        multilingual: { score: 3.2, status: 'PASS', reason: 'No toxicity' },
        hatesonar: { score: 1.4, status: 'PASS', reason: 'Benign text' }
      },
      summary: 'Content is CLEAN across all models.'
    }
  },
  {
    id: 'image-check',
    method: 'POST',
    path: '/v2/image/check',
    name: 'Image Check',
    tag: 'Image',
    tagColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    description: 'Detect NSFW/explicit content in images using NudeNet, CLIP, FalconSAI, and ViT-NSFW models. Send image as Base64 string.',
    authRequired: true,
    fields: [
      {
        key: 'image', type: 'base64', label: 'Image',
        placeholder: 'Paste Base64 encoded image string, or upload a file...',
        required: true,
        hint: 'Upload an image file to auto-convert, or paste Base64 directly'
      }
    ],
    exampleRequest: { image: '/9j/4AAQSkZJRgAB...' },
    exampleResponse: {
      final_score: 5.2,
      verdict: 'SAFE',
      threshold_used: 0.6,
      models: {
        nudenet: { score: 3.1, status: 'PASS', reason: 'No explicit content' },
        clip: { score: 8.4, status: 'PASS', reason: 'Safe content' },
        falconsai: { score: 4.0, status: 'PASS', reason: 'SFW' },
        vit_nsfw: { score: 5.2, status: 'PASS', reason: 'No nudity detected' }
      },
      summary: 'Image is SAFE across all detection models.'
    }
  },
  {
    id: 'image-custom',
    method: 'POST',
    path: '/v2/image/custom',
    name: 'Image (Custom)',
    tag: 'Image',
    tagColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    description: 'Custom image moderation with specific labels, strict label list, and adjustable threshold.',
    authRequired: true,
    fields: [
      {
        key: 'image', type: 'base64', label: 'Image',
        placeholder: 'Paste Base64 string or upload file...',
        required: true,
        hint: 'Upload an image file to auto-convert'
      },
      {
        key: 'labels', type: 'tags', label: 'Labels',
        placeholder: 'Add label and press Enter...',
        hint: 'e.g. nsfw, violence, gore'
      },
      {
        key: 'strict_labels', type: 'tags', label: 'Strict Labels (optional)',
        placeholder: 'Add strict label...',
        hint: 'These trigger immediate FAIL regardless of threshold'
      },
      {
        key: 'threshold', type: 'slider', label: 'Threshold',
        min: 0.01, max: 1.0, step: 0.01, defaultValue: 0.5,
        hint: 'Lower = stricter moderation'
      }
    ],
    exampleRequest: { image: '/9j/...', labels: ['nsfw', 'violence'], strict_labels: ['explicit'], threshold: 0.5 },
    exampleResponse: {
      final_score: 12.3,
      verdict: 'SAFE',
      threshold_used: 0.5,
      models: {},
      summary: 'Image passed all custom label checks.'
    }
  },
  {
    id: 'models-list',
    method: 'GET',
    path: '/v2/models',
    name: 'List Models',
    tag: 'Models',
    tagColor: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    description: 'Retrieve all available AI models, their types (image/abuse), descriptions, and active status.',
    authRequired: true,
    fields: [],
    exampleRequest: null,
    exampleResponse: {
      image_models: [
        { name: 'NudeNet', type: 'image', description: 'Explicit content detector', is_active: true },
        { name: 'CLIP', type: 'image', description: 'OpenAI vision model', is_active: true },
        { name: 'FalconSAI', type: 'image', description: 'NSFW image classifier', is_active: true },
        { name: 'ViT-NSFW', type: 'image', description: 'Vision transformer NSFW', is_active: true }
      ],
      abuse_models: [
        { name: 'Detoxify', type: 'abuse', description: 'Toxicity classifier', is_active: true },
        { name: 'XLM-RoBERTa', type: 'abuse', description: 'Multilingual toxic classifier', is_active: true },
        { name: 'HateSonar', type: 'abuse', description: 'Hate speech detector', is_active: true }
      ],
      total: 7
    }
  },
  {
    id: 'status',
    method: 'GET',
    path: '/v2/status',
    name: 'API Status',
    tag: 'Health',
    tagColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    description: 'Check the overall API health — confirms the API, models, and database are all online.',
    authRequired: false,
    fields: [],
    exampleRequest: null,
    exampleResponse: { api: '✅ online', models: '✅ loaded', database: '✅ connected' }
  }
];

// ── JSON Syntax Highlighter ─────────────────────────────────────────
function JsonView({ data }) {
  const json = JSON.stringify(data, null, 2);
  const highlighted = json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="text-cyan-300">"$1"</span>:')
    .replace(/: "(.*?)"/g, ': <span class="text-emerald-300">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="text-yellow-300">$1</span>')
    .replace(/: (true|false)/g, ': <span class="text-orange-300">$1</span>')
    .replace(/: (null)/g, ': <span class="text-gray-500">$1</span>');
  return (
    <pre
      className="text-xs font-mono leading-relaxed text-gray-300 overflow-x-auto whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

// ── Main Component ──────────────────────────────────────────────────
export default function Playground() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('test'); // 'test' | 'docs'

  // Tester state
  const [selectedId, setSelectedId] = useState('abuse-check');
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('playground_api_key') || ''
  );
  const [fieldValues, setFieldValues] = useState({});
  const [tagInput, setTagInput] = useState({});
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState(null); // { status, time, data, error }
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fileRefs = useRef({});
  const endpoint = ENDPOINTS.find(e => e.id === selectedId);

  // ── Field helpers ─────────────────────────────────────────────────
  const setField = (key, val) => setFieldValues(prev => ({ ...prev, [key]: val }));

  const addTag = (key, val) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    const current = fieldValues[key] || [];
    if (!current.includes(trimmed)) setField(key, [...current, trimmed]);
    setTagInput(prev => ({ ...prev, [key]: '' }));
  };

  const removeTag = (key, tag) => {
    setField(key, (fieldValues[key] || []).filter(t => t !== tag));
  };

  // ── File → Base64 ─────────────────────────────────────────────────
  const handleFileUpload = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      setField(key, base64);
    };
    reader.readAsDataURL(file);
  };

  // ── Switch endpoint ───────────────────────────────────────────────
  const switchEndpoint = (id) => {
    setSelectedId(id);
    setFieldValues({});
    setTagInput({});
    setResponse(null);
    setDropdownOpen(false);
  };

  // ── Run request ───────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (!apiKey.trim() && endpoint.authRequired) {
      setResponse({ error: 'API key is required for this endpoint.' });
      return;
    }

    // Build body
    const body = {};
    for (const f of endpoint.fields) {
      const val = fieldValues[f.key];
      if (f.type === 'slider') {
        body[f.key] = val !== undefined ? parseFloat(val) : f.defaultValue;
      } else if (f.type === 'tags') {
        body[f.key] = val || [];
      } else if (f.type === 'textarea' || f.type === 'base64') {
        if (val) body[f.key] = val;
        else if (f.required) {
          setResponse({ error: `"${f.label}" is required.` });
          return;
        }
      }
    }

    setRunning(true);
    setResponse(null);

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey.trim()) {
      headers['X-API-Key'] = apiKey.trim();
      localStorage.setItem('playground_api_key', apiKey.trim());
    }

    const start = performance.now();
    try {
      const fetchOpts = {
        method: endpoint.method,
        headers,
      };
      if (endpoint.method === 'POST') {
        fetchOpts.body = JSON.stringify(body);
      }

      const res = await fetch(`${API_BASE}${endpoint.path}`, fetchOpts);
      const elapsed = Math.round(performance.now() - start);
      let data;
      try { data = await res.json(); } catch { data = { raw: await res.text() }; }

      setResponse({ status: res.status, time: elapsed, data, ok: res.ok });
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      setResponse({ error: err.message || 'Network error. Check CORS or connection.', time: elapsed });
    } finally {
      setRunning(false);
    }
  }, [apiKey, endpoint, fieldValues]);

  // ── Logout ────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
    } catch { /* ignore */ }
    localStorage.clear();
    navigate('/login');
  };

  // ── Copy response ─────────────────────────────────────────────────
  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(response?.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen w-full bg-[#050A0F] flex">

      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,136,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,255,136,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/4 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/4 rounded-full blur-[140px]" />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebar(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className="fixed top-0 left-0 h-full w-64 z-40 lg:relative lg:translate-x-0 flex flex-col"
        style={{ display: 'flex' }}
      >
        <div className="h-full bg-[#080D13] border-r border-white/[0.06] flex flex-col">

          {/* Logo */}
          <div className="p-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/25 to-cyan-500/25 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Shield style={{ width: 18, height: 18 }} className="text-emerald-400" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Guard<span className="text-emerald-400">Net</span>
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-3 font-mono">API Playground</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            <SideNavItem to="/dashboard"    icon={LayoutDashboard} label="Dashboard" />
            <SideNavItem to="/playground"   icon={FlaskConical}    label="Playground" active />
            <SideNavItem to="/create-key"   icon={Plus}            label="Create Key" />
            <SideNavItem to="/user"         icon={User}            label="Profile" />
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

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 relative z-10 flex flex-col">

        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-[#050A0F]/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebar(true)}
                className="lg:hidden text-gray-500 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg leading-none">Playground</h1>
                  <p className="text-gray-600 text-xs mt-0.5">Test & Explore the API</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <TabBtn active={activeTab === 'test'} onClick={() => setActiveTab('test')} icon={Terminal}>
                Test
              </TabBtn>
              <TabBtn active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} icon={BookOpen}>
                Docs
              </TabBtn>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'test' ? (
              <motion.div
                key="test"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-6xl mx-auto px-4 sm:px-6 py-8"
              >
                <TestPanel
                  endpoint={endpoint}
                  endpoints={ENDPOINTS}
                  apiKey={apiKey}
                  setApiKey={setApiKey}
                  fieldValues={fieldValues}
                  setField={setField}
                  tagInput={tagInput}
                  setTagInput={setTagInput}
                  addTag={addTag}
                  removeTag={removeTag}
                  handleFileUpload={handleFileUpload}
                  fileRefs={fileRefs}
                  running={running}
                  response={response}
                  copied={copied}
                  copyResponse={copyResponse}
                  handleRun={handleRun}
                  dropdownOpen={dropdownOpen}
                  setDropdownOpen={setDropdownOpen}
                  switchEndpoint={switchEndpoint}
                />
              </motion.div>
            ) : (
              <motion.div
                key="docs"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6"
              >
                <DocsPanel endpoints={ENDPOINTS} onTryIt={(id) => { setSelectedId(id); setActiveTab('test'); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ── Test Panel ─────────────────────────────────────────────────────
function TestPanel({
  endpoint, endpoints, apiKey, setApiKey,
  fieldValues, setField, tagInput, setTagInput,
  addTag, removeTag, handleFileUpload, fileRefs,
  running, response, copied, copyResponse, handleRun,
  dropdownOpen, setDropdownOpen, switchEndpoint
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">

      {/* LEFT — Request Builder */}
      <div className="space-y-5">

        {/* Endpoint Selector */}
        <div className="bg-[#0A1118] border border-white/10 rounded-2xl p-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Endpoint
          </label>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="w-full flex items-center justify-between gap-3 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm text-white transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${endpoint.tagColor}`}>
                  {endpoint.method}
                </span>
                <span className="font-mono text-gray-300 truncate">{endpoint.path}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-0 right-0 z-30 bg-[#0D1520] border border-white/15 rounded-xl overflow-hidden shadow-2xl"
                >
                  {endpoints.map(ep => (
                    <button
                      key={ep.id}
                      onClick={() => switchEndpoint(ep.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-white/5 ${
                        ep.id === endpoint.id ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${ep.tagColor}`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-gray-400 text-xs truncate">{ep.path}</span>
                      <span className="text-gray-600 text-xs ml-auto flex-shrink-0">{ep.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Endpoint Info */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${endpoint.tagColor}`}>
              {endpoint.tag}
            </span>
            {endpoint.authRequired ? (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full font-semibold">
                <Lock className="w-2.5 h-2.5" /> Requires API Key
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-semibold">
                <Globe className="w-2.5 h-2.5" /> Public
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">{endpoint.description}</p>
        </div>

        {/* API Key */}
        <div className="bg-[#0A1118] border border-white/10 rounded-2xl p-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            API Key
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk_live_••••••••••••••••••••••••••••••••"
              className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 text-white placeholder-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm font-mono outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <p className="text-[11px] text-gray-600 mt-2 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Stored locally in your browser. Never sent to our servers except with API calls.
          </p>
        </div>

        {/* Dynamic Fields */}
        {endpoint.fields.length > 0 && (
          <div className="bg-[#0A1118] border border-white/10 rounded-2xl p-5 space-y-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Request Body
            </label>

            {endpoint.fields.map(field => (
              <div key={field.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {field.hint && (
                    <span className="text-[10px] text-gray-600">{field.hint}</span>
                  )}
                </div>

                {field.type === 'textarea' && (
                  <textarea
                    value={fieldValues[field.key] || ''}
                    onChange={e => setField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/40 text-white placeholder-gray-700 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/15 resize-none font-mono leading-relaxed"
                  />
                )}

                {field.type === 'base64' && (
                  <div className="space-y-2">
                    {/* File upload button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fileRefs.current[field.key]?.click()}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-xs font-medium transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Image
                      </button>
                      {fieldValues[field.key] && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {Math.round(fieldValues[field.key].length * 0.75 / 1024)}KB loaded
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={el => fileRefs.current[field.key] = el}
                        onChange={e => handleFileUpload(field.key, e.target.files[0])}
                      />
                    </div>
                    <textarea
                      value={fieldValues[field.key] || ''}
                      onChange={e => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/40 text-white placeholder-gray-700 rounded-xl px-4 py-3 text-xs outline-none transition-all focus:ring-2 focus:ring-emerald-500/15 resize-none font-mono"
                    />
                  </div>
                )}

                {field.type === 'slider' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={fieldValues[field.key] ?? field.defaultValue}
                        onChange={e => setField(field.key, e.target.value)}
                        className="flex-1 accent-emerald-500"
                      />
                      <span className="text-sm font-bold text-emerald-400 w-12 text-right font-mono">
                        {parseFloat(fieldValues[field.key] ?? field.defaultValue).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600">
                      <span>Strict ({field.min})</span>
                      <span>Lenient ({field.max})</span>
                    </div>
                  </div>
                )}

                {field.type === 'tags' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput[field.key] || ''}
                        onChange={e => setTagInput(prev => ({ ...prev, [field.key]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(field.key, tagInput[field.key] || ''); } }}
                        placeholder={field.placeholder}
                        className="flex-1 bg-white/5 border border-white/10 focus:border-emerald-500/40 text-white placeholder-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                      />
                      <button
                        onClick={() => addTag(field.key, tagInput[field.key] || '')}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white px-3 rounded-xl transition-all text-xs font-medium"
                      >
                        Add
                      </button>
                    </div>
                    {(fieldValues[field.key] || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(fieldValues[field.key] || []).map(tag => (
                          <span key={tag} className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-lg font-mono">
                            {tag}
                            <button onClick={() => removeTag(field.key, tag)} className="text-emerald-600 hover:text-emerald-300 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Run Button */}
        <motion.button
          onClick={handleRun}
          disabled={running}
          whileHover={{ scale: running ? 1 : 1.02 }}
          whileTap={{ scale: running ? 1 : 0.98 }}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_24px_rgba(16,185,129,0.2)] disabled:shadow-none text-sm"
        >
          {running ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
          ) : (
            <><Play className="w-4 h-4" /> Send Request</>
          )}
        </motion.button>
      </div>

      {/* RIGHT — Response Viewer */}
      <div className="space-y-5">

        {/* URL Preview */}
        <div className="bg-[#0A1118] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md border flex-shrink-0 ${endpoint.tagColor}`}>
              {endpoint.method}
            </span>
            <code className="text-xs font-mono text-gray-400 break-all">
              <span className="text-gray-600">{API_BASE}</span>
              <span className="text-emerald-400">{endpoint.path}</span>
            </code>
          </div>
        </div>

        {/* Response Box */}
        <div className="bg-[#0A1118] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-400">Response</span>
              {response?.status && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                  response.ok
                    ? 'text-emerald-400 bg-emerald-400/10'
                    : 'text-red-400 bg-red-400/10'
                }`}>
                  {response.status}
                </span>
              )}
              {response?.time !== undefined && (
                <span className="text-[11px] text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{response.time}ms
                </span>
              )}
            </div>
            {response?.data && (
              <button
                onClick={copyResponse}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          <div className="p-5 min-h-[300px] max-h-[520px] overflow-y-auto">
            {!response && !running && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Terminal className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Hit "Send Request" to see the response</p>
                <p className="text-xs text-gray-700 mt-1">Results will appear here</p>
              </div>
            )}

            {running && (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10 animate-ping" />
                </div>
                <p className="text-sm text-gray-600 mt-4">Waiting for response...</p>
              </div>
            )}

            {!running && response?.error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400">Error</p>
                  <p className="text-xs text-red-400/70 mt-1">{response.error}</p>
                </div>
              </div>
            )}

            {!running && response?.data && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <JsonView data={response.data} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Example Response */}
        {endpoint.exampleResponse && (
          <div className="bg-[#0A1118] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.06]">
              <span className="text-xs font-semibold text-gray-600">Example Response</span>
            </div>
            <div className="p-5 max-h-56 overflow-y-auto opacity-50 hover:opacity-80 transition-opacity">
              <JsonView data={endpoint.exampleResponse} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Docs Panel ─────────────────────────────────────────────────────
function DocsPanel({ endpoints, onTryIt }) {
  const groups = ['Abuse', 'Image', 'Models', 'Health'];
  const baseUrl = API_BASE;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-emerald-400" />
          </div>
          <h2 className="text-white font-bold text-lg">API Reference</h2>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Base URL: <code className="font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-lg text-xs">{baseUrl}</code>
          <span className="ml-3 text-gray-600">·</span>
          <span className="ml-3">All endpoints require <code className="font-mono text-amber-400 text-xs bg-amber-400/10 px-1.5 py-0.5 rounded">X-API-Key</code> header unless marked Public</span>
        </p>
      </div>

      {/* Auth Info */}
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-400 mb-1">Authentication</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Pass your API key in the <code className="font-mono text-amber-300">X-API-Key</code> request header. Get your key from the{' '}
              <a href="/dashboard" className="text-emerald-400 hover:underline">Dashboard</a>.
            </p>
            <div className="mt-3 bg-black/30 border border-white/10 rounded-xl p-3">
              <code className="text-xs font-mono text-gray-400">
                <span className="text-gray-600">// Example header</span><br />
                <span className="text-cyan-300">X-API-Key</span>: <span className="text-emerald-300">sk_live_yourKeyHere</span>
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoint Cards */}
      {endpoints.map((ep, i) => (
        <motion.div
          key={ep.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.35 }}
          className="bg-[#0A1118] border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/[0.06]">
            <div className="flex items-start gap-3 min-w-0">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex-shrink-0 mt-0.5 ${ep.tagColor}`}>
                {ep.method}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="font-mono text-sm text-white font-semibold">{ep.path}</code>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ep.tagColor}`}>
                    {ep.tag}
                  </span>
                  {!ep.authRequired && (
                    <span className="text-[10px] text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" /> Public
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{ep.description}</p>
              </div>
            </div>
            <button
              onClick={() => onTryIt(ep.id)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/15 border border-emerald-400/20 px-3 py-1.5 rounded-xl transition-all flex-shrink-0"
            >
              <Play className="w-3 h-3" /> Try it
            </button>
          </div>

          {/* Body / Params */}
          {ep.fields.length > 0 && (
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {ep.method === 'POST' ? 'Request Body' : 'Parameters'}
              </p>
              <div className="space-y-2">
                {ep.fields.map(f => (
                  <div key={f.key} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <code className="font-mono text-xs text-cyan-300 flex-shrink-0 mt-0.5 w-28">{f.key}</code>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded font-mono">
                          {f.type === 'slider' ? 'float' : f.type === 'tags' ? 'string[]' : f.type === 'base64' ? 'string (base64)' : 'string'}
                        </span>
                        {f.required && (
                          <span className="text-[10px] text-red-400 font-semibold">required</span>
                        )}
                      </div>
                      {f.hint && <p className="text-[11px] text-gray-600 mt-0.5">{f.hint}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Example Request */}
          {ep.exampleRequest && (
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Example Request</p>
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 overflow-x-auto">
                <JsonView data={ep.exampleRequest} />
              </div>
            </div>
          )}

          {/* Example Response */}
          <div className="px-6 py-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Example Response</p>
            <div className="bg-black/30 border border-white/10 rounded-xl p-4 overflow-x-auto max-h-56 overflow-y-auto">
              <JsonView data={ep.exampleResponse} />
            </div>
          </div>
        </motion.div>
      ))}

      {/* Rate Limits */}
      <div className="bg-[#0A1118] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-bold text-white">Rate Limits & Limits</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Per Minute', value: '60 requests', icon: Clock, color: 'text-emerald-400' },
            { label: 'Per Day', value: '1,000 requests', icon: Zap, color: 'text-cyan-400' },
            { label: 'Max Keys', value: '5 per account', icon: KeyRound, color: 'text-violet-400' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
              <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
              <div>
                <p className="text-sm font-bold text-white">{item.value}</p>
                <p className="text-[11px] text-gray-600">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Helper Components ───────────────────────────────────────────────
function SideNavItem({ to, icon: Icon, label, active }) {
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

function TabBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        active
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {children}
    </button>
  );
}
