// pages/Home.jsx

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Shield, Zap, Eye, Globe, KeyRound, BarChart3,
  ArrowRight, CheckCircle2, ChevronRight, Github,
  MessageSquare, Image, Cpu, Lock, Activity,
  Terminal, BookOpen, Star, TrendingUp
} from 'lucide-react';

// ── Animated Counter ────────────────────────────────────────────────
function Counter({ to, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Code snippet preview ────────────────────────────────────────────
const CODE_SNIPPET = `const res = await fetch(
  "https://yukiapi.site/v2/abuse/check",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "sk_live_••••••••••••••••"
    },
    body: JSON.stringify({
      text: "Some user-generated content..."
    })
  }
);

const { verdict, final_score } = await res.json();
// verdict: "CLEAN" | "TOXIC"`;

// ── Features ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Text Moderation',
    desc: 'Detect toxic, hateful, and abusive content across multiple languages using Detoxify, XLM-RoBERTa, and HateSonar models.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/20',
  },
  {
    icon: Image,
    title: 'Image Moderation',
    desc: 'NSFW and explicit content detection powered by NudeNet, CLIP, FalconSAI, and ViT-NSFW — four models working in concert.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10 border-cyan-400/20',
  },
  {
    icon: Cpu,
    title: 'Multi-Model Ensemble',
    desc: 'Every request runs through multiple AI models simultaneously, producing a consensus score that reduces false positives.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10 border-violet-400/20',
  },
  {
    icon: Zap,
    title: 'Custom Thresholds',
    desc: 'Tune sensitivity with Normal, Medium, or Strict modes — or pass an exact threshold to match your platform\'s requirements.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/20',
  },
  {
    icon: Lock,
    title: 'Secure API Keys',
    desc: 'Per-key access control, disable without delete, rate limiting per key, and VPN/proxy detection to prevent abuse.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    desc: 'Real-time dashboard with request counts, endpoint breakdowns, and per-key usage — always know your consumption.',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10 border-pink-400/20',
  },
];

const STATS = [
  { value: 7, suffix: '+', label: 'AI Models' },
  { value: 99, suffix: '%', label: 'Uptime' },
  { value: 60, suffix: '/min', label: 'Req Limit' },
  { value: 5, suffix: 'ms', label: 'Avg Latency' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Register & Verify', desc: 'Create your account with email OTP, or OAuth via Google & GitHub.' },
  { step: '02', title: 'Generate API Key', desc: 'Create up to 5 named API keys from your dashboard instantly.' },
  { step: '03', title: 'Send a Request', desc: 'POST your text or base64 image to our endpoint with your key.' },
  { step: '04', title: 'Get a Verdict', desc: 'Receive CLEAN/TOXIC or SAFE/NSFW with per-model scores and reasons.' },
];

// ══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════
export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#050A0F] text-white overflow-x-hidden">

      {/* ── Grid Background ────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,136,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,255,136,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-[-10%] right-[10%]  w-[600px] h-[600px] bg-emerald-500/6  rounded-full blur-[160px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[500px] h-[500px] bg-cyan-500/5    rounded-full blur-[140px]" />
        <div className="absolute top-[50%]  left-[40%] w-[400px] h-[400px] bg-violet-500/4  rounded-full blur-[160px]" />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="relative z-20 border-b border-white/[0.05] bg-[#050A0F]/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-500/40 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-base font-black tracking-tight">
              Guard<span className="text-emerald-400">Net</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-500 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative z-10 pt-24 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Content Moderation API · v2.0
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight"
          >
            Moderate content
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              with confidence.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            GuardNet runs your text and images through multiple AI models simultaneously —
            delivering accurate, explainable verdicts via a single REST API call.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
          >
            <Link
              to="/register"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold px-7 py-3.5 rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.25)] text-sm w-full sm:w-auto justify-center"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold px-7 py-3.5 rounded-2xl transition-all text-sm w-full sm:w-auto justify-center"
            >
              <BookOpen className="w-4 h-4" /> See the docs
            </a>
          </motion.div>

          {/* Trusted by / social proof */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 text-xs text-gray-600 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            No credit card required &nbsp;·&nbsp;
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Free to start &nbsp;·&nbsp;
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            1,000 requests/day
          </motion.p>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
              className="bg-[#0A1118] border border-white/10 rounded-2xl p-5 text-center"
            >
              <p className="text-3xl font-black text-white">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Code Preview ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-emerald-500/15 rounded-3xl blur-xl" />
            <div className="relative bg-[#080D13] border border-white/10 rounded-2xl overflow-hidden">

              {/* Code header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-xs text-gray-600 font-mono">abuse-check.js</span>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live API
                </div>
              </div>

              {/* Code */}
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed">
                  {CODE_SNIPPET.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="text-gray-700 w-8 text-right mr-5 flex-shrink-0 select-none text-xs leading-6">
                        {i + 1}
                      </span>
                      <span
                        className="text-gray-300"
                        dangerouslySetInnerHTML={{
                          __html: line
                            .replace(/("https?:\/\/[^"]*")/g, '<span class="text-emerald-300">$1</span>')
                            .replace(/"(X-API-Key|Content-Type|method|headers|body|text)"/g, '<span class="text-cyan-300">"$1"</span>')
                            .replace(/\b(await|const|fetch|JSON\.stringify|JSON\.stringify)\b/g, '<span class="text-violet-400">$1</span>')
                            .replace(/"(POST|GET)"/g, '<span class="text-orange-400">"$1"</span>')
                            .replace(/("sk_live_[^"]*")/g, '<span class="text-yellow-300">$1</span>')
                            .replace(/(\/\/ .*)/g, '<span class="text-gray-600">$1</span>')
                            .replace(/("CLEAN" \| "TOXIC")/g, '<span class="text-emerald-400">$1</span>')
                        }}
                      />
                    </div>
                  ))}
                </pre>
              </div>

              {/* Response preview */}
              <div className="border-t border-white/[0.06] px-6 py-4 bg-emerald-500/[0.03]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-lg">200 OK</span>
                  <span className="text-[11px] text-gray-600">Response</span>
                </div>
                <pre className="text-xs font-mono text-gray-400 leading-relaxed">
{`{ "verdict": "CLEAN", "final_score": 2.1, "threshold_used": 0.6,
  "models": { "detoxify": { "score": 1.8, "status": "PASS" }, ... } }`}
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3"
            >
              Everything you need
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.45 }}
              className="text-3xl sm:text-4xl font-black"
            >
              Built for modern platforms.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.4 }}
              className="text-gray-500 mt-3 text-sm max-w-xl mx-auto"
            >
              Whether you're running a chat app, social platform, marketplace, or SaaS tool —
              GuardNet keeps your community safe.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
                className="bg-[#0A1118] border border-white/10 hover:border-white/15 rounded-2xl p-6 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${f.bg}`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3"
            >
              Simple Integration
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.45 }}
              className="text-3xl sm:text-4xl font-black"
            >
              Up and running in minutes.
            </motion.h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[28px] top-10 bottom-10 w-px bg-gradient-to-b from-emerald-500/30 via-cyan-500/20 to-transparent hidden sm:block" />

            <div className="space-y-6">
              {HOW_IT_WORKS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-emerald-400 font-mono">{step.step}</span>
                  </div>
                  <div className="flex-1 bg-[#0A1118] border border-white/10 rounded-2xl px-5 py-4">
                    <h3 className="font-bold text-white text-sm mb-1">{step.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3"
            >
              Pricing
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.45 }}
              className="text-3xl sm:text-4xl font-black"
            >
              Simple, transparent plans.
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4 }}
              className="bg-[#0A1118] border border-white/10 rounded-2xl p-6"
            >
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Free</p>
              <p className="text-4xl font-black text-white mb-1">$0</p>
              <p className="text-xs text-gray-600 mb-6">Forever free</p>
              <ul className="space-y-2.5 mb-7">
                {[
                  '1,000 requests / day',
                  'Up to 5 API keys',
                  'Text & Image moderation',
                  'Usage dashboard',
                  'Standard support',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-gray-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full text-center text-sm font-bold py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-all"
              >
                Get started free
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.4 }}
              className="relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 rounded-[18px] blur-md" />
              <div className="relative bg-gradient-to-br from-[#0D1A14] to-[#0A1118] border border-emerald-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Pro</p>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/15 border border-emerald-400/25 px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                </div>
                <p className="text-4xl font-black text-white mb-1">$19<span className="text-lg font-semibold text-gray-500">/mo</span></p>
                <p className="text-xs text-gray-600 mb-6">Scale with confidence</p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    '100,000 requests / day',
                    'Unlimited API keys',
                    'Priority queue processing',
                    'Webhook notifications',
                    'Priority support',
                    'Custom model thresholds',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="block w-full text-center text-sm font-bold py-3 rounded-xl bg-gradient-to-r from-emerald-600/50 to-cyan-600/50 text-gray-400 cursor-not-allowed border border-emerald-500/20"
                >
                  Notify me
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-cyan-500/15 to-emerald-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-gradient-to-br from-[#0D1A14] via-[#0A1118] to-[#0A1118] border border-emerald-500/20 rounded-3xl p-10 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px]" />
              <div className="relative">
                <Shield className="w-12 h-12 text-emerald-400/40 mx-auto mb-5" />
                <h2 className="text-3xl sm:text-4xl font-black mb-3">
                  Start moderating today.
                </h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  Free forever for up to 1,000 requests/day. No credit card needed.
                  Integrate in under 5 minutes.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/register"
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] text-sm"
                  >
                    Create free account <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Already have an account? Sign in <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-sm font-black">Guard<span className="text-emerald-400">Net</span></span>
          </div>

          <p className="text-xs text-gray-700">
            © 2025 GuardNet · AI Content Moderation API
          </p>

          <div className="flex items-center gap-5">
            <Link to="/login"    className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Login</Link>
            <Link to="/register" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Register</Link>
            <a href="https://yukiapi.site/docs" target="_blank" rel="noopener noreferrer"
               className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1">
              <Terminal className="w-3 h-3" /> API Docs
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
