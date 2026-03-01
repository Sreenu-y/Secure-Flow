"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BookOpen,
  Zap,
  Code2,
  Key,
  Search,
  ChevronRight,
  Terminal,
  Globe,
  Shield,
  Copy,
  CheckCheck,
  ExternalLink,
  FileText,
  Lock,
  Activity,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

const SECTIONS = [
  { id: "quickstart", label: "Quick Start", icon: Zap },
  { id: "api", label: "API Reference", icon: Globe },
  { id: "sdk", label: "SDK Integration", icon: Code2 },
  { id: "authentication", label: "Authentication", icon: Lock },
  { id: "webhooks", label: "Webhooks", icon: Activity },
];

const API_ENDPOINTS = [
  {
    method: "POST",
    path: "/api/v1/predict",
    description: "Run fraud prediction on a single transaction",
    params: [
      "step",
      "type",
      "amount",
      "oldbalanceOrg",
      "newbalanceOrig",
      "oldbalanceDest",
      "newbalanceDest",
      "errorBalanceOrig",
      "errorBalanceDest",
    ],
    methodColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    response: `{
  "transaction_id": "txn_abc123",
  "is_fraud": false,
  "fraud_probability": 0.032,
  "risk_level": "LOW",
  "model": "random_forest_v2",
  "latency_ms": 12
}`,
  },
  {
    method: "POST",
    path: "/v1/transaction/batch",
    description:
      "Run fraud prediction on multiple transactions at once (max 500)",
    params: ["transactions[]"],
    methodColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    response: `{
  "results": [...],
  "total": 12,
  "fraud_count": 1,
  "processing_time_ms": 48
}`,
  },
  {
    method: "GET",
    path: "/v1/model/metrics",
    description: "Retrieve current model performance metrics",
    params: [],
    methodColor: "bg-green-500/10 text-green-400 border-green-500/20",
    response: `{
  "model": "random_forest_v2",
  "auc_roc": 0.9986,
  "f1_score": 0.9214,
  "precision": 0.9341,
  "recall": 0.9091
}`,
  },
];

const CODE_SNIPPETS = {
  python: `<span className="text-purple-400">import</span> <span className="text-yellow-400">requests</span>

<span className="text-blue-400">API_KEY</span> = <span className="text-green-400">"sf_live_your_api_key"</span>
<span className="text-blue-400">BASE_URL</span> = <span className="text-green-400">"https://api.secureflow.io"</span>

<span className="text-purple-400">def</span> <span className="text-yellow-400">predict_transaction</span>(transaction: <span className="text-cyan-400">dict</span>) -> <span className="text-cyan-400">dict</span>:
    response = requests.<span className="text-blue-200">post</span>(
        <span className="text-green-400">f"</span><span className="text-blue-400">{BASE_URL}</span><span className="text-green-400">/api/v1/predict"</span>,
        headers={<span className="text-green-400">"Authorization"</span>: <span className="text-green-400">f"Bearer </span><span className="text-blue-400">{API_KEY}</span><span className="text-green-400">"</span>},
        json=transaction,
    )
    response.<span className="text-blue-200">raise_for_status</span>()
    <span className="text-purple-400">return</span> response.<span className="text-blue-200">json</span>()

result = <span className="text-yellow-400">predict_transaction</span>({
    <span className="text-green-400">"step"</span>: <span className="text-yellow-400">1</span>,
    <span className="text-green-400">"type"</span>: <span className="text-yellow-400">0</span>,
    <span className="text-green-400">"amount"</span>: <span className="text-yellow-400">48293.50</span>,
    <span className="text-green-400">"oldbalanceOrg"</span>: <span className="text-yellow-400">120000.00</span>,
    <span className="text-green-400">"newbalanceOrig"</span>: <span className="text-yellow-400">71706.50</span>,
    <span className="text-green-400">"oldbalanceDest"</span>: <span className="text-yellow-400">0.0</span>,
    <span className="text-green-400">"newbalanceDest"</span>: <span className="text-yellow-400">0.0</span>,
    <span className="text-green-400">"errorBalanceOrig"</span>: <span className="text-yellow-400">0.0</span>,
    <span className="text-green-400">"errorBalanceDest"</span>: <span className="text-yellow-400">48293.50</span>
})`,

  javascript: `<span className="text-purple-400">const</span> <span className="text-blue-400">API_KEY</span> = <span className="text-green-400">"sf_live_your_api_key"</span>;
<span className="text-purple-400">const</span> <span className="text-blue-400">BASE_URL</span> = <span className="text-green-400">"https://api.secureflow.io"</span>;

<span className="text-purple-400">async</span> <span className="text-purple-400">function</span> <span className="text-yellow-400">predictTransaction</span>(<span className="text-blue-200">transaction</span>) {
  <span className="text-purple-400">const</span> <span className="text-blue-200">response</span> = <span className="text-purple-400">await</span> <span className="text-yellow-400">fetch</span>(\`\${<span className="text-blue-400">BASE_URL</span>}/api/v1/predict\`, {
    method: <span className="text-green-400">"POST"</span>,
    headers: {
      <span className="text-green-400">"Authorization"</span>: \`Bearer \${<span className="text-blue-400">API_KEY</span>}\`,
      <span className="text-green-400">"Content-Type"</span>: <span className="text-green-400">"application/json"</span>,
    },
    body: JSON.<span className="text-blue-200">stringify</span>(transaction),
  });

  <span className="text-purple-400">if</span> (!response.ok) <span className="text-purple-400">throw</span> <span className="text-purple-400">new</span> <span className="text-yellow-400">Error</span>(\`HTTP \${response.status}\`);
  <span className="text-purple-400">return</span> response.<span className="text-yellow-400">json</span>();
}`,

  curl: `<span className="text-yellow-400">curl</span> <span className="text-purple-400">-X</span> POST https://api.secureflow.io/api/v1/predict \\
  <span className="text-purple-400">-H</span> <span className="text-green-400">"Authorization: Bearer sf_live_your_api_key"</span> \\
  <span className="text-purple-400">-H</span> <span className="text-green-400">"Content-Type: application/json"</span> \\
  <span className="text-purple-400">-d</span> <span className="text-cyan-400">'{
    "step": 1,
    "type": 0,
    "amount": 48293.50,
    "oldbalanceOrg": 120000.00,
    "newbalanceOrig": 71706.50,
    "oldbalanceDest": 0.0,
    "newbalanceDest": 0.0,
    "errorBalanceOrig": 0.0,
    "errorBalanceDest": 48293.50
  }'</span>`,
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Strip HTML tags for actual clipboard content
    const plainText = text.replace(/<[^>]*>?/gm, "");
    await navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5 active:scale-95"
    >
      {copied ? (
        <>
          <CheckCheck className="h-3.5 w-3.5 text-green-400" />
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

function CodeBlock({ code, language }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <pre
        className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5 overflow-x-auto text-[13px] font-mono text-gray-300 leading-relaxed relative z-10"
        dangerouslySetInnerHTML={{ __html: code }}
      />
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <CopyButton text={code} />
      </div>
    </div>
  );
}

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("quickstart");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLang, setActiveLang] = useState("python");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Premium Glass Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-black/60 backdrop-blur-xl border-white/10 py-3"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="container mx-auto max-w-7xl px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              SecureFlow <span className="text-gray-500 font-medium">Docs</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <div className="h-4 w-[1px] bg-white/10" />
            <button className="text-xs px-3 py-1.5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20 font-semibold hover:bg-blue-600/20 transition-all">
              API v2.1.0
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 pt-32 pb-24 flex gap-12">
        {/* Immersive Glass Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-32 space-y-8">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
              />
            </div>

            <nav className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 px-3 mb-3">
                Core Documentation
              </p>
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      active
                        ? "bg-blue-600/10 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      className={`h-4.5 w-4.5 shrink-0 transition-transform ${active ? "scale-110 text-blue-400" : "group-hover:scale-110"}`}
                    />
                    {s.label}
                    {active && (
                      <div className="ml-auto w-1 h-4 bg-blue-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 px-3">
                Developers
              </p>
              <div className="space-y-1">
                {[
                  { label: "Changelog", icon: FileText },
                  { label: "Platform Status", icon: Activity },
                  { label: "API Explorer", icon: Terminal },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.label}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-all text-left"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {r.label}
                      <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Quick Start Content */}
            {activeSection === "quickstart" && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-wider uppercase">
                    <Zap className="h-3 w-3" /> Get Started
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                    Integration Guide
                  </h1>
                  <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
                    Deploy world-class fraud detection in minutes. This guide
                    walks you through authenticating, sending your first
                    transaction, and interpreting the risk scores.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  {[
                    {
                      step: "01",
                      title: "API Keys",
                      desc: "Provision keys in the portal",
                      icon: Key,
                      color: "from-blue-500/20 to-cyan-500/20",
                    },
                    {
                      step: "02",
                      title: "Endpoint",
                      desc: "Integrate the predict API",
                      icon: Terminal,
                      color: "from-purple-500/20 to-pink-500/20",
                    },
                    {
                      step: "03",
                      title: "Decisions",
                      desc: "Act on real-time risk scores",
                      icon: Shield,
                      color: "from-emerald-500/20 to-teal-500/20",
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative overflow-hidden group hover:border-white/20 transition-colors"
                    >
                      <div
                        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.color} blur-3xl opacity-50 group-hover:opacity-80 transition-opacity`}
                      />
                      <div className="relative z-10 space-y-3">
                        <span className="text-[10px] font-mono font-bold text-gray-600">
                          {s.step}
                        </span>
                        <h4 className="font-bold text-white flex items-center gap-2">
                          <s.icon className="h-4 w-4 text-gray-400" />
                          {s.title}
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-blue-400" />
                      Client Implementation
                    </h3>
                    <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-lg">
                      {["python", "javascript", "curl"].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setActiveLang(lang)}
                          className={`text-[11px] px-3 py-1.5 rounded-md font-bold transition-all capitalize ${
                            activeLang === lang
                              ? "bg-white/10 text-white shadow-sm"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                  <CodeBlock
                    code={CODE_SNIPPETS[activeLang]}
                    language={activeLang}
                  />
                </div>

                <div className="flex gap-4 p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                  <div className="p-2 rounded-xl bg-blue-500/10 h-fit">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-blue-200">
                      Production Reminder
                    </p>
                    <p className="text-xs text-blue-200/60 leading-relaxed max-w-xl">
                      Always store{" "}
                      <code className="text-blue-300 bg-blue-500/10 px-1 rounded">
                        SECRET_KEYS
                      </code>{" "}
                      in environment variables. Never commit them to version
                      control. Use our{" "}
                      <Link
                        href="/dashboard/apikeys"
                        className="text-blue-400 underline underline-offset-4 hover:text-blue-300"
                      >
                        keys management
                      </Link>{" "}
                      to rotate compromised secrets.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* API Reference Content */}
            {activeSection === "api" && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                    <Globe className="h-3 w-3" /> REST Protocol
                  </div>
                  <h1 className="text-4xl font-bold text-white">
                    API Reference
                  </h1>
                  <p className="text-gray-400 max-w-2xl leading-relaxed">
                    Access individual endpoints for prediction, monitoring, and
                    alert management.
                  </p>
                </div>

                <div className="space-y-8">
                  {API_ENDPOINTS.map((ep, i) => (
                    <div
                      key={i}
                      className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest border ${ep.methodColor}`}
                        >
                          {ep.method}
                        </span>
                        <code className="text-lg text-white font-mono">
                          {ep.path}
                        </code>
                      </div>

                      <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <div>
                            <p className="text-sm font-medium text-gray-300 mb-2">
                              Description
                            </p>
                            <p className="text-sm text-gray-500 leading-relaxed">
                              {ep.description}
                            </p>
                          </div>
                          {ep.params.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-300 mb-3">
                                Body Parameters
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {ep.params.map((p) => (
                                  <code
                                    key={p}
                                    className="text-[11px] px-2 py-1 rounded-md bg-white/5 border border-white/5 text-gray-400 font-mono italic"
                                  >
                                    {p}
                                  </code>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
                            Sample Response
                          </p>
                          <CodeBlock code={ep.response} language="json" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Authentication Content */}
            {activeSection === "authentication" && (
              <div className="space-y-12 max-w-3xl">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-wider uppercase">
                    <Lock className="h-3 w-3" /> Security
                  </div>
                  <h1 className="text-4xl font-bold text-white">
                    Authentication
                  </h1>
                  <p className="text-gray-400 leading-relaxed">
                    SecureFlow uses API keys to authenticate requests. Managed
                    through the developer dashboard, keys allow you to interact
                    with our infrastructure securely.
                  </p>
                </div>

                <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-8 space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">
                        Bearer Token Strategy
                      </h4>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Pass your secret key in the standard Authorization
                        header as a Bearer token.
                      </p>
                      <CodeBlock
                        code={`<span>Authorization:</span> <span className="text-green-400">Bearer sf_live_*******************</span>`}
                        language="javascript"
                      />
                    </div>

                    <div className="grid gap-6">
                      {[
                        {
                          type: "Live Environment",
                          prefix: "sf_live_",
                          desc: "Active fraud analysis on real volume. Bills against your monthly quota.",
                          color: "text-blue-400",
                        },
                        {
                          type: "Test Sandbox",
                          prefix: "sf_test_",
                          desc: "Development only. Returns deterministic mocks without consuming credits.",
                          color: "text-amber-400",
                        },
                      ].map((k) => (
                        <div
                          key={k.type}
                          className="p-4 rounded-xl bg-black/20 border border-white/5 flex gap-4"
                        >
                          <div className="w-1.5 h-full bg-blue-500/20 rounded-full" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-white">
                                {k.type}
                              </span>
                              <code
                                className={`text-[11px] px-1.5 py-0.5 rounded bg-white/5 ${k.color} font-mono`}
                              >
                                {k.prefix}*
                              </code>
                            </div>
                            <p className="text-xs text-gray-500">{k.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* SDK Integration Content */}
            {activeSection === "sdk" && (
              <div className="space-y-12 max-w-4xl">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold tracking-wider uppercase">
                    <Code2 className="h-3 w-3" /> Libraries
                  </div>
                  <h1 className="text-4xl font-bold text-white">
                    SDK Integration
                  </h1>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    We provide official SDKs for Node.js and Python to make it
                    trivial to integrate SecureFlow into your application. These
                    libraries handle authentication, retries, and formatting for
                    you.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Node.js SDK */}
                  <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Terminal className="h-5 w-5 text-blue-400" />
                          Node.js
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400">
                        Install using npm or yarn:
                      </p>
                      <CodeBlock
                        code={"npm install @secureflow/node"}
                        language="bash"
                      />

                      <p className="text-sm text-gray-400 pt-2">Basic usage:</p>
                      <CodeBlock
                        code={`<span className="text-purple-400">const</span> SecureFlow = <span className="text-yellow-400">require</span>(<span className="text-green-400">'@secureflow/node'</span>);

<span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> <span className="text-yellow-400">SecureFlow</span>(<span className="text-green-400">'sf_live_your_key'</span>);

<span className="text-purple-400">const</span> result = <span className="text-purple-400">await</span> client.transactions.<span className="text-yellow-400">predict</span>({
  amount: <span className="text-yellow-400">450.00</span>,
  type: <span className="text-green-400">'PAYMENT'</span>
});`}
                        language="javascript"
                      />
                    </div>
                  </Card>

                  {/* Python SDK */}
                  <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Terminal className="h-5 w-5 text-yellow-500" />
                          Python
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400">
                        Install using pip:
                      </p>
                      <CodeBlock
                        code={"pip install secureflow-python"}
                        language="bash"
                      />

                      <p className="text-sm text-gray-400 pt-2">Basic usage:</p>
                      <CodeBlock
                        code={`<span className="text-purple-400">from</span> secureflow <span className="text-purple-400">import</span> Client

client = <span className="text-yellow-400">Client</span>(api_key=<span className="text-green-400">'sf_live_your_key'</span>)

result = client.transactions.<span className="text-yellow-400">predict</span>(
    amount=<span className="text-yellow-400">450.00</span>,
    type=<span className="text-green-400">'PAYMENT'</span>
)`}
                        language="python"
                      />
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Webhooks Content */}
            {activeSection === "webhooks" && (
              <div className="space-y-12 max-w-4xl">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold tracking-wider uppercase">
                    <Activity className="h-3 w-3" /> Event Driven
                  </div>
                  <h1 className="text-4xl font-bold text-white">Webhooks</h1>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    SecureFlow uses webhooks to notify your application when
                    asynchronous events happen, such as batch predictions
                    finishing or high-risk transactions requiring manual review.
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white">
                    Listening for Events
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Set up an endpoint on your server to receive POST requests.
                    SecureFlow will send a JSON payload with the event details.
                    It is crucial that you verify the webhook signature to
                    ensure the request originated from us.
                  </p>

                  <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden shadow-xl p-6">
                    <h4 className="font-bold text-white mb-4">
                      Express.js Example with Validation
                    </h4>
                    <CodeBlock
                      code={`<span className="text-purple-400">const</span> express = <span className="text-yellow-400">require</span>(<span className="text-green-400">'express'</span>);
<span className="text-purple-400">const</span> crypto = <span className="text-yellow-400">require</span>(<span className="text-green-400">'crypto'</span>);
<span className="text-purple-400">const</span> app = <span className="text-yellow-400">express</span>();

<span className="text-gray-500">// Secret from your dashboard</span>
<span className="text-purple-400">const</span> <span className="text-blue-400">WEBHOOK_SECRET</span> = <span className="text-green-400">'whsec_your_secret_here'</span>;

app.<span className="text-blue-200">post</span>(<span className="text-green-400">'/webhook/secureflow'</span>, express.<span className="text-yellow-400">raw</span>({ type: <span className="text-green-400">'application/json'</span> }), (req, res) => {
  <span className="text-purple-400">const</span> signature = req.headers[<span className="text-green-400">'sf-signature'</span>];
  
  <span className="text-gray-500">// Verify signature</span>
  <span className="text-purple-400">const</span> hash = crypto
    .<span className="text-yellow-400">createHmac</span>(<span className="text-green-400">'sha256'</span>, <span className="text-blue-400">WEBHOOK_SECRET</span>)
    .<span className="text-yellow-400">update</span>(req.body)
    .<span className="text-yellow-400">digest</span>(<span className="text-green-400">'hex'</span>);
    
  <span className="text-purple-400">if</span> (hash !== signature) {
    <span className="text-purple-400">return</span> res.<span className="text-yellow-400">status</span>(<span className="text-yellow-400">401</span>).<span className="text-yellow-400">send</span>(<span className="text-green-400">'Invalid signature'</span>);
  }

  <span className="text-purple-400">const</span> event = JSON.<span className="text-yellow-400">parse</span>(req.body);
  
  <span className="text-purple-400">if</span> (event.type === <span className="text-green-400">'transaction.flagged'</span>) {
    console.<span className="text-blue-200">log</span>(<span className="text-green-400">'High risk transaction detected:'</span>, event.data.transaction_id);
    <span className="text-gray-500">// Handle the flagged transaction...</span>
  }

  res.<span className="text-yellow-400">status</span>(<span className="text-yellow-400">200</span>).<span className="text-yellow-400">send</span>();
});`}
                      language="javascript"
                    />
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto max-w-7xl px-6 flex justify-between items-center opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-bold">SecureFlow</span>
          </div>
          <p className="text-[10px] font-mono tracking-widest uppercase">
            System Operational
          </p>
        </div>
      </footer>
    </div>
  );
}
