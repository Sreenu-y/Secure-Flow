"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Zap,
  Code2,
  Key,
  Search,
  Terminal,
  Globe,
  Shield,
  Copy,
  CheckCheck,
  Lock,
  Activity,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  ArrowRight,
  Hash,
} from "lucide-react";

// ─── Navigation tree ────────────────────────────────────────────────────────

const NAV = [
  {
    group: "Getting Started",
    items: [
      {
        id: "quickstart",
        label: "Quick Start",
        icon: Zap,
        toc: [
          "Overview",
          "Install & authenticate",
          "First prediction",
          "Reading the response",
        ],
      },
    ],
  },
  {
    group: "API Reference",
    items: [
      {
        id: "api",
        label: "REST Endpoints",
        icon: Globe,
        toc: ["Base URL", "POST /predict", "POST /batch", "GET /metrics"],
      },
      {
        id: "authentication",
        label: "Authentication",
        icon: Lock,
        toc: ["Bearer tokens", "Key types", "Rotating keys"],
      },
      {
        id: "errors",
        label: "Errors & Rate Limits",
        icon: AlertTriangle,
        toc: ["HTTP status codes", "Error object", "Rate limits"],
      },
    ],
  },
  {
    group: "Integrations",
    items: [
      {
        id: "sdk",
        label: "SDK Reference",
        icon: Code2,
        toc: ["Node.js SDK", "Python SDK", "Go SDK"],
      },
      {
        id: "webhooks",
        label: "Webhooks",
        icon: Activity,
        toc: ["Event types", "Signature verification", "Express example"],
      },
    ],
  },
];

const FLAT_SECTIONS = NAV.flatMap((g) => g.items);

// ─── Data ────────────────────────────────────────────────────────────────────

const PREDICT_PARAMS = [
  {
    name: "step",
    type: "integer",
    req: true,
    desc: "Hour of the simulation (1 = first hour)",
  },
  {
    name: "type",
    type: "integer",
    req: true,
    desc: "Transaction type: 0 = TRANSFER, 1 = CASH_OUT",
  },
  {
    name: "amount",
    type: "float",
    req: true,
    desc: "Transaction amount in USD",
  },
  {
    name: "oldbalanceOrg",
    type: "float",
    req: true,
    desc: "Sender balance before transaction",
  },
  {
    name: "newbalanceOrig",
    type: "float",
    req: true,
    desc: "Sender balance after transaction",
  },
  {
    name: "oldbalanceDest",
    type: "float",
    req: true,
    desc: "Receiver balance before transaction",
  },
  {
    name: "newbalanceDest",
    type: "float",
    req: true,
    desc: "Receiver balance after transaction",
  },
  {
    name: "errorBalanceOrig",
    type: "float",
    req: false,
    desc: "Balance discrepancy on sender side (computed)",
  },
  {
    name: "errorBalanceDest",
    type: "float",
    req: false,
    desc: "Balance discrepancy on receiver side (computed)",
  },
];

const ERROR_CODES = [
  {
    status: 200,
    label: "OK",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
    desc: "Request succeeded.",
  },
  {
    status: 400,
    label: "Bad Request",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    desc: "Missing or invalid parameters.",
  },
  {
    status: 401,
    label: "Unauthorized",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    desc: "API key missing or invalid.",
  },
  {
    status: 403,
    label: "Forbidden",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    desc: "Key lacks permission for this resource.",
  },
  {
    status: 422,
    label: "Unprocessable Entity",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    desc: "Schema valid but values out of range.",
  },
  {
    status: 429,
    label: "Too Many Requests",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    desc: "Rate limit exceeded. See Retry-After header.",
  },
  {
    status: 500,
    label: "Internal Server Error",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    desc: "Server-side failure. Report to support.",
  },
];

const WEBHOOK_EVENTS = [
  {
    event: "transaction.flagged",
    trigger: "Fraud probability exceeds your policy threshold",
    retry: 3,
  },
  {
    event: "transaction.blocked",
    trigger: "Transaction auto-blocked by high-risk policy",
    retry: 3,
  },
  {
    event: "batch.completed",
    trigger: "Batch prediction job finishes processing",
    retry: 1,
  },
  {
    event: "model.drift_detected",
    trigger: "Model performance drops below acceptable baseline",
    retry: 1,
  },
  {
    event: "quota.80_percent",
    trigger: "Usage reaches 80% of plan limit",
    retry: 1,
  },
];

// ─── Code snippets ───────────────────────────────────────────────────────────

const SNIPPETS = {
  python: `<span class="text-purple-400">import</span> <span class="text-yellow-400">requests</span>

<span class="text-blue-400">API_KEY</span> = <span class="text-green-400">"sf_live_your_api_key"</span>
<span class="text-blue-400">BASE_URL</span> = <span class="text-green-400">"https://api.secureflow.io"</span>

<span class="text-purple-400">def</span> <span class="text-yellow-400">predict</span>(txn: <span class="text-cyan-400">dict</span>) -> <span class="text-cyan-400">dict</span>:
    r = requests.<span class="text-blue-200">post</span>(
        <span class="text-green-400">f"{BASE_URL}/api/v1/predict"</span>,
        headers={<span class="text-green-400">"Authorization"</span>: <span class="text-green-400">f"Bearer {API_KEY}"</span>},
        json=txn,
        timeout=<span class="text-yellow-400">5</span>,
    )
    r.<span class="text-blue-200">raise_for_status</span>()
    <span class="text-purple-400">return</span> r.<span class="text-blue-200">json</span>()

result = <span class="text-yellow-400">predict</span>({
    <span class="text-green-400">"step"</span>: <span class="text-yellow-400">1</span>, <span class="text-green-400">"type"</span>: <span class="text-yellow-400">0</span>, <span class="text-green-400">"amount"</span>: <span class="text-yellow-400">48293.50</span>,
    <span class="text-green-400">"oldbalanceOrg"</span>: <span class="text-yellow-400">120000.00</span>, <span class="text-green-400">"newbalanceOrig"</span>: <span class="text-yellow-400">71706.50</span>,
    <span class="text-green-400">"oldbalanceDest"</span>: <span class="text-yellow-400">0.0</span>,  <span class="text-green-400">"newbalanceDest"</span>: <span class="text-yellow-400">0.0</span>,
})
<span class="text-purple-400">print</span>(result[<span class="text-green-400">"is_fraud"</span>], result[<span class="text-green-400">"fraud_probability"</span>])`,

  javascript: `<span class="text-purple-400">const</span> <span class="text-blue-400">API_KEY</span> = <span class="text-green-400">"sf_live_your_api_key"</span>;
<span class="text-purple-400">const</span> <span class="text-blue-400">BASE_URL</span> = <span class="text-green-400">"https://api.secureflow.io"</span>;

<span class="text-purple-400">async function</span> <span class="text-yellow-400">predict</span>(<span class="text-blue-200">txn</span>) {
  <span class="text-purple-400">const</span> res = <span class="text-purple-400">await</span> <span class="text-yellow-400">fetch</span>(\`\${<span class="text-blue-400">BASE_URL</span>}/api/v1/predict\`, {
    method: <span class="text-green-400">"POST"</span>,
    headers: {
      <span class="text-green-400">"Authorization"</span>: \`Bearer \${<span class="text-blue-400">API_KEY</span>}\`,
      <span class="text-green-400">"Content-Type"</span>: <span class="text-green-400">"application/json"</span>,
    },
    body: JSON.<span class="text-blue-200">stringify</span>(txn),
  });
  <span class="text-purple-400">if</span> (!res.ok) <span class="text-purple-400">throw new</span> <span class="text-yellow-400">Error</span>(\`HTTP \${res.status}\`);
  <span class="text-purple-400">return</span> res.<span class="text-yellow-400">json</span>();
}`,

  curl: `<span class="text-yellow-400">curl</span> <span class="text-purple-400">-X</span> POST https://api.secureflow.io/api/v1/predict \\
  <span class="text-purple-400">-H</span> <span class="text-green-400">"Authorization: Bearer sf_live_your_api_key"</span> \\
  <span class="text-purple-400">-H</span> <span class="text-green-400">"Content-Type: application/json"</span> \\
  <span class="text-purple-400">-d</span> <span class="text-cyan-400">'{
    "step": 1, "type": 0, "amount": 48293.50,
    "oldbalanceOrg": 120000.00, "newbalanceOrig": 71706.50,
    "oldbalanceDest": 0.0,  "newbalanceDest": 0.0
  }'</span>`,
};

const PREDICT_RESPONSE = `{
  <span class="text-blue-300">"transaction_id"</span>: <span class="text-green-400">"txn_01HXYZ"</span>,
  <span class="text-blue-300">"is_fraud"</span>: <span class="text-orange-400">false</span>,
  <span class="text-blue-300">"fraud_probability"</span>: <span class="text-yellow-400">0.032</span>,
  <span class="text-blue-300">"risk_level"</span>: <span class="text-green-400">"LOW"</span>,
  <span class="text-blue-300">"model"</span>: <span class="text-green-400">"random_forest_v2"</span>,
  <span class="text-blue-300">"latency_ms"</span>: <span class="text-yellow-400">12</span>
}`;

// ─── Small re-usable components ───────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text.replace(/<[^>]*>/g, ""));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
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

function CodeBlock({ code, label, filename }) {
  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/10">
      {(label || filename) && (
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2">
            {filename && (
              <span className="text-xs text-gray-500 font-mono">
                {filename}
              </span>
            )}
            {label && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                {label}
              </span>
            )}
          </div>
          <CopyButton text={code} />
        </div>
      )}
      <pre
        className="bg-[#0d0d0d] p-5 overflow-x-auto text-[13px] font-mono text-gray-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: code }}
      />
      {!label && !filename && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={code} />
        </div>
      )}
    </div>
  );
}

function ParamTable({ params }) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
              Parameter
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
              Type
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
              Required
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {params.map((p) => (
            <tr
              key={p.name}
              className="hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-4 py-3">
                <code className="text-blue-300 font-mono text-[12px] bg-blue-500/5 px-1.5 py-0.5 rounded">
                  {p.name}
                </code>
              </td>
              <td className="px-4 py-3">
                <span className="text-purple-400 font-mono text-[11px]">
                  {p.type}
                </span>
              </td>
              <td className="px-4 py-3">
                {p.req ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-semibold">
                    required
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/10 border border-gray-500/20 text-gray-500">
                    optional
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs leading-relaxed">
                {p.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionHeader({
  badge,
  badgeColor,
  icon: Icon,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
}) {
  return (
    <div className="space-y-3 pb-8 border-b border-white/10">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${badgeColor}`}
      >
        {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
        {badge}
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-white">{title}</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        {subtitle}
      </p>
    </div>
  );
}

function Callout({ type = "info", children }) {
  const styles = {
    info: {
      bg: "bg-blue-500/8 border-blue-500/20",
      icon: Info,
      iconClass: "text-blue-400",
    },
    warning: {
      bg: "bg-amber-500/8 border-amber-500/20",
      icon: AlertTriangle,
      iconClass: "text-amber-400",
    },
    success: {
      bg: "bg-green-500/8 border-green-500/20",
      icon: CheckCircle2,
      iconClass: "text-green-400",
    },
    danger: {
      bg: "bg-red-500/8 border-red-500/20",
      icon: XCircle,
      iconClass: "text-red-400",
    },
  };
  const s = styles[type];
  const Icon = s.icon;
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${s.bg}`}>
      <Icon className={`h-4 w-4 ${s.iconClass} shrink-0 mt-0.5`} />
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}

function Heading({ level = 2, id, children }) {
  const Tag = `h${level}`;
  const sizes = { 2: "text-2xl mt-10 mb-4", 3: "text-lg mt-8 mb-3" };
  return (
    <Tag
      id={id}
      className={`font-bold text-white flex items-center gap-2 group ${sizes[level]}`}
    >
      <a
        href={`#${id}`}
        className="opacity-0 group-hover:opacity-50 transition-opacity"
      >
        <Hash className="h-4 w-4" />
      </a>
      {children}
    </Tag>
  );
}

// ─── Page sections ────────────────────────────────────────────────────────────

function QuickStart({ setLang, lang }) {
  return (
    <div className="space-y-10">
      <SectionHeader
        badge="Get Started"
        badgeColor="bg-blue-500/10 border-blue-500/20 text-blue-400"
        badgeIcon={Zap}
        title="Quick Start"
        subtitle="Detect fraud on your first transaction in under 5 minutes. No infrastructure required."
      />

      {/* Steps */}
      <div className="space-y-6">
        {[
          {
            n: "01",
            title: "Generate an API key",
            color: "border-blue-500/30 bg-blue-500/5",
            num: "bg-blue-600",
            body: (
              <p className="text-sm text-gray-400 leading-relaxed">
                Go to{" "}
                <Link
                  href="/dashboard/apikeys"
                  className="text-blue-400 hover:underline"
                >
                  Dashboard → API Keys
                </Link>{" "}
                and click <strong className="text-white">Create Key</strong>.
                Give it a name and copy the key — it won&apos;t be shown again.
              </p>
            ),
          },
          {
            n: "02",
            title: "Store it securely",
            color: "border-purple-500/30 bg-purple-500/5",
            num: "bg-purple-600",
            body: (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  Never hardcode keys. Add it to your environment:
                </p>
                <CodeBlock
                  code={`<span class="text-blue-400">SECUREFLOW_API_KEY</span>=<span class="text-green-400">sf_live_xxxxxxxxxxxx</span>`}
                  filename=".env.local"
                />
              </div>
            ),
          },
          {
            n: "03",
            title: "Send your first prediction",
            color: "border-emerald-500/30 bg-emerald-500/5",
            num: "bg-emerald-600",
            body: (
              <div className="space-y-4">
                <div className="flex gap-1 p-1 w-fit bg-white/5 border border-white/10 rounded-lg">
                  {["python", "javascript", "curl"].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`text-[11px] px-3 py-1.5 rounded-md font-semibold transition-all capitalize ${lang === l ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <CodeBlock code={SNIPPETS[lang]} label={lang} />
              </div>
            ),
          },
          {
            n: "04",
            title: "Read the response",
            color: "border-cyan-500/30 bg-cyan-500/5",
            num: "bg-cyan-600",
            body: (
              <div className="space-y-4">
                <CodeBlock code={PREDICT_RESPONSE} label="JSON Response" />
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    {
                      field: "is_fraud",
                      desc: "Boolean decision based on your policy threshold",
                    },
                    {
                      field: "fraud_probability",
                      desc: "Model confidence score 0.0 – 1.0",
                    },
                    {
                      field: "risk_level",
                      desc: "LOW / MEDIUM / HIGH / CRITICAL",
                    },
                  ].map((f) => (
                    <div
                      key={f.field}
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <code className="text-blue-300 text-xs font-mono">
                        {f.field}
                      </code>
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
        ].map((step, i, arr) => (
          <div key={step.n} className="flex gap-5">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`h-8 w-8 rounded-full ${step.num} flex items-center justify-center text-xs font-black text-white shrink-0`}
              >
                {step.n}
              </div>
              {i < arr.length - 1 && (
                <div className="w-px flex-1 bg-white/10" />
              )}
            </div>
            <div
              className={`flex-1 rounded-xl border ${step.color} p-5 space-y-3 mb-2`}
            >
              <h3 className="font-bold text-white text-sm">{step.title}</h3>
              {step.body}
            </div>
          </div>
        ))}
      </div>

      <Callout type="warning">
        Store your API key in environment variables only. Never commit it to
        version control or expose it in client-side code.
      </Callout>
    </div>
  );
}

function ApiReference() {
  return (
    <div className="space-y-10">
      <SectionHeader
        badge="REST API"
        badgeColor="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        badgeIcon={Globe}
        title="REST Endpoints"
        subtitle="JSON over HTTPS. All requests must include your API key in the Authorization header."
      />

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Base URL
        </span>
        <code className="text-sm text-white font-mono">
          https://api.secureflow.io
        </code>
        <CopyButton text="https://api.secureflow.io" />
      </div>

      {/* POST /predict */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest border bg-blue-500/10 text-blue-400 border-blue-500/20">
            POST
          </span>
          <code className="text-lg text-white font-mono">/api/v1/predict</code>
          <span className="text-xs text-gray-600">— single transaction</span>
        </div>
        <p className="text-gray-400 text-sm">
          Returns a fraud verdict and probability score for one transaction in
          real time.
        </p>
        <Heading level={3} id="predict-params">
          Request parameters
        </Heading>
        <ParamTable params={PREDICT_PARAMS} />
        <Heading level={3} id="predict-response">
          Response
        </Heading>
        <CodeBlock code={PREDICT_RESPONSE} label="200 OK" />
      </div>

      <hr className="border-white/10" />

      {/* POST /batch */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest border bg-blue-500/10 text-blue-400 border-blue-500/20">
            POST
          </span>
          <code className="text-lg text-white font-mono">/api/v1/batch</code>
          <span className="text-xs text-gray-600">
            — bulk scoring (max 500)
          </span>
        </div>
        <p className="text-gray-400 text-sm">
          Submit up to 500 transactions in a single request for batch
          processing.
        </p>
        <CodeBlock
          label="200 OK"
          code={`{
  <span class="text-blue-300">"results"</span>: [ <span class="text-gray-500">/* array of predict responses */</span> ],
  <span class="text-blue-300">"total"</span>: <span class="text-yellow-400">12</span>,
  <span class="text-blue-300">"fraud_count"</span>: <span class="text-yellow-400">1</span>,
  <span class="text-blue-300">"processing_time_ms"</span>: <span class="text-yellow-400">48</span>
}`}
        />
      </div>

      <hr className="border-white/10" />

      {/* GET /metrics */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest border bg-green-500/10 text-green-400 border-green-500/20">
            GET
          </span>
          <code className="text-lg text-white font-mono">
            /api/v1/model/metrics
          </code>
        </div>
        <p className="text-gray-400 text-sm">
          Current production model performance statistics.
        </p>
        <CodeBlock
          label="200 OK"
          code={`{
  <span class="text-blue-300">"model"</span>: <span class="text-green-400">"random_forest_v2"</span>,
  <span class="text-blue-300">"auc_roc"</span>: <span class="text-yellow-400">0.9986</span>,
  <span class="text-blue-300">"f1_score"</span>: <span class="text-yellow-400">0.9214</span>,
  <span class="text-blue-300">"precision"</span>: <span class="text-yellow-400">0.9341</span>,
  <span class="text-blue-300">"recall"</span>: <span class="text-yellow-400">0.9091</span>
}`}
        />
      </div>
    </div>
  );
}

function Authentication() {
  return (
    <div className="space-y-10">
      <SectionHeader
        badge="Security"
        badgeColor="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
        badgeIcon={Lock}
        title="Authentication"
        subtitle="All API requests must be authenticated with an API key passed as a Bearer token."
      />

      <Heading level={2} id="bearer">
        Bearer tokens
      </Heading>
      <CodeBlock
        code={`Authorization: Bearer <span class="text-green-400">sf_live_xxxxxxxxxxxxxxxxxxxx</span>`}
        filename="HTTP Header"
      />

      <Heading level={2} id="key-types">
        Key types
      </Heading>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            prefix: "sf_live_",
            label: "Live",
            desc: "Real predictions against production data. Billed against your plan quota.",
            color: "text-blue-400",
            border: "border-blue-500/20 bg-blue-500/5",
          },
          {
            prefix: "sf_test_",
            label: "Test",
            desc: "Deterministic mock responses. Does not consume quota. Safe for CI/CD.",
            color: "text-amber-400",
            border: "border-amber-500/20 bg-amber-500/5",
          },
        ].map((k) => (
          <div
            key={k.label}
            className={`p-5 rounded-xl border ${k.border} space-y-2`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {k.label} Key
              </span>
              <code
                className={`text-[11px] px-1.5 py-0.5 rounded bg-white/5 ${k.color} font-mono`}
              >
                {k.prefix}*
              </code>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{k.desc}</p>
          </div>
        ))}
      </div>

      <Heading level={2} id="rotating">
        Rotating keys
      </Heading>
      <p className="text-gray-400 text-sm leading-relaxed">
        Generate a new key before revoking the old one. Both keys will be valid
        simultaneously during a brief overlap period, allowing you to update
        your services without downtime.
      </p>
      <Callout type="danger">
        Deleting a key is immediate and irreversible. Any service using that key
        will receive{" "}
        <code className="text-red-300 bg-red-500/10 px-1 rounded text-xs">
          401 Unauthorized
        </code>{" "}
        responses instantly.
      </Callout>
    </div>
  );
}

function Errors() {
  return (
    <div className="space-y-10">
      <SectionHeader
        badge="Errors"
        badgeColor="bg-orange-500/10 border-orange-500/20 text-orange-400"
        badgeIcon={AlertTriangle}
        title="Errors & Rate Limits"
        subtitle="SecureFlow uses conventional HTTP status codes. Errors include a machine-readable code and a human-readable message."
      />

      <Heading level={2} id="http-status">
        HTTP status codes
      </Heading>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                Code
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                Label
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ERROR_CODES.map((e) => (
              <tr
                key={e.status}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded border font-mono font-bold ${e.color}`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300 text-xs font-medium">
                  {e.label}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{e.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Heading level={2} id="error-object">
        Error object
      </Heading>
      <CodeBlock
        label="4xx / 5xx Body"
        code={`{
  <span class="text-blue-300">"error"</span>: {
    <span class="text-blue-300">"code"</span>: <span class="text-green-400">"invalid_parameter"</span>,
    <span class="text-blue-300">"message"</span>: <span class="text-green-400">"'amount' must be a positive number"</span>,
    <span class="text-blue-300">"param"</span>: <span class="text-green-400">"amount"</span>,
    <span class="text-blue-300">"request_id"</span>: <span class="text-green-400">"req_01HXYZ"</span>
  }
}`}
      />

      <Heading level={2} id="rate-limits">
        Rate limits
      </Heading>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                Plan
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                Requests / min
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                Monthly quota
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              { plan: "Free", rpm: 60, quota: "5,000 calls" },
              { plan: "Pro", rpm: 600, quota: "100,000 calls" },
              { plan: "Enterprise", rpm: "Custom", quota: "Unlimited" },
            ].map((r) => (
              <tr
                key={r.plan}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3 text-white font-medium text-xs">
                  {r.plan}
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                  {r.rpm}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{r.quota}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-gray-500 text-xs">
        When rate-limited, the response includes a{" "}
        <code className="text-gray-300 bg-white/5 px-1 rounded">
          Retry-After
        </code>{" "}
        header with the number of seconds to wait.
      </p>
    </div>
  );
}

function SdkSection() {
  return (
    <div className="space-y-10">
      <SectionHeader
        badge="Libraries"
        badgeColor="bg-purple-500/10 border-purple-500/20 text-purple-400"
        badgeIcon={Code2}
        title="SDK Reference"
        subtitle="Official client libraries handle auth, retries, and serialization so you don't have to."
      />

      {[
        {
          lang: "Node.js",
          install: "npm install @secureflow/node",
          badge: "v2.4.1",
          icon: "⬡",
          color: "text-green-400",
          code: `<span class="text-purple-400">const</span> { SecureFlow } = <span class="text-yellow-400">require</span>(<span class="text-green-400">'@secureflow/node'</span>);

<span class="text-purple-400">const</span> client = <span class="text-purple-400">new</span> <span class="text-yellow-400">SecureFlow</span>({ apiKey: process.env.<span class="text-blue-400">SECUREFLOW_API_KEY</span> });

<span class="text-purple-400">const</span> result = <span class="text-purple-400">await</span> client.transactions.<span class="text-yellow-400">predict</span>({
  step: <span class="text-yellow-400">1</span>, type: <span class="text-yellow-400">0</span>, amount: <span class="text-yellow-400">48293.50</span>
});
console.<span class="text-blue-200">log</span>(result.is_fraud, result.fraud_probability);`,
        },
        {
          lang: "Python",
          install: "pip install secureflow",
          badge: "v2.1.0",
          icon: "🐍",
          color: "text-yellow-400",
          code: `<span class="text-purple-400">from</span> secureflow <span class="text-purple-400">import</span> Client

client = <span class="text-yellow-400">Client</span>(api_key=<span class="text-green-400">"sf_live_xxxx"</span>)

result = client.transactions.<span class="text-yellow-400">predict</span>(
    step=<span class="text-yellow-400">1</span>, type=<span class="text-yellow-400">0</span>, amount=<span class="text-yellow-400">48293.50</span>
)
<span class="text-purple-400">print</span>(result.is_fraud, result.fraud_probability)`,
        },
        {
          lang: "Go",
          install: "go get github.com/secureflow/secureflow-go",
          badge: "v1.3.2",
          icon: "🐹",
          color: "text-cyan-400",
          code: `<span class="text-purple-400">import</span> sf <span class="text-green-400">"github.com/secureflow/secureflow-go"</span>

client := sf.<span class="text-yellow-400">NewClient</span>(os.<span class="text-yellow-400">Getenv</span>(<span class="text-green-400">"SECUREFLOW_API_KEY"</span>))
result, _ := client.Transactions.<span class="text-yellow-400">Predict</span>(context.<span class="text-yellow-400">Background</span>(), sf.PredictParams{
    Step: <span class="text-yellow-400">1</span>, Type: <span class="text-yellow-400">0</span>, Amount: <span class="text-yellow-400">48293.50</span>,
})`,
        },
      ].map((s) => (
        <div key={s.lang} className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">{s.icon}</span>
            <h3 className="text-lg font-bold text-white">{s.lang}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500 font-mono">
              {s.badge}
            </span>
          </div>
          <CodeBlock code={s.install} filename="install" />
          <CodeBlock code={s.code} label={s.lang.toLowerCase()} />
        </div>
      ))}
    </div>
  );
}

function Webhooks() {
  return (
    <div className="space-y-10">
      <SectionHeader
        badge="Event Driven"
        badgeColor="bg-pink-500/10 border-pink-500/20 text-pink-400"
        badgeIcon={Activity}
        title="Webhooks"
        subtitle="Get notified in real time when transactions are flagged, blocked, or when your model drifts."
      />

      <Heading level={2} id="event-types">
        Event types
      </Heading>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                Event
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                Trigger
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
                Retries
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {WEBHOOK_EVENTS.map((e) => (
              <tr
                key={e.event}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3">
                  <code className="text-pink-300 font-mono text-[12px] bg-pink-500/5 px-1.5 py-0.5 rounded">
                    {e.event}
                  </code>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{e.trigger}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{e.retry}×</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Heading level={2} id="signature">
        Signature verification
      </Heading>
      <p className="text-gray-400 text-sm leading-relaxed">
        Each webhook includes a{" "}
        <code className="text-gray-200 bg-white/5 px-1 rounded text-xs">
          sf-signature
        </code>{" "}
        header. Compute an HMAC-SHA256 of the raw request body using your
        webhook secret and compare it to the header value.
      </p>

      <Callout type="warning">
        Always verify the signature before processing the payload. Skipping
        verification allows attackers to forge fraudulent events.
      </Callout>

      <Heading level={2} id="express-example">
        Express.js example
      </Heading>
      <CodeBlock
        filename="webhook.js"
        code={`<span class="text-purple-400">const</span> express = <span class="text-yellow-400">require</span>(<span class="text-green-400">'express'</span>);
<span class="text-purple-400">const</span> crypto  = <span class="text-yellow-400">require</span>(<span class="text-green-400">'crypto'</span>);

<span class="text-purple-400">const</span> <span class="text-blue-400">SECRET</span> = process.env.<span class="text-blue-400">SECUREFLOW_WEBHOOK_SECRET</span>;

app.<span class="text-blue-200">post</span>(<span class="text-green-400">'/webhook'</span>, express.<span class="text-yellow-400">raw</span>({ type: <span class="text-green-400">'*/*'</span> }), (req, res) => {
  <span class="text-purple-400">const</span> sig  = req.headers[<span class="text-green-400">'sf-signature'</span>];
  <span class="text-purple-400">const</span> hash = crypto.<span class="text-yellow-400">createHmac</span>(<span class="text-green-400">'sha256'</span>, <span class="text-blue-400">SECRET</span>)
                      .<span class="text-yellow-400">update</span>(req.body).<span class="text-yellow-400">digest</span>(<span class="text-green-400">'hex'</span>);

  <span class="text-purple-400">if</span> (hash !== sig) <span class="text-purple-400">return</span> res.<span class="text-yellow-400">sendStatus</span>(<span class="text-yellow-400">401</span>);

  <span class="text-purple-400">const</span> { type, data } = JSON.<span class="text-yellow-400">parse</span>(req.body);

  <span class="text-purple-400">if</span> (type === <span class="text-green-400">'transaction.flagged'</span>) {
    <span class="text-gray-500">// Block in your database, notify your team, etc.</span>
    console.<span class="text-blue-200">log</span>(<span class="text-green-400">'Flagged:'</span>, data.transaction_id);
  }

  res.<span class="text-yellow-400">sendStatus</span>(<span class="text-yellow-400">200</span>); <span class="text-gray-500">// Acknowledge within 5s</span>
});`}
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("quickstart");
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState("python");
  const [scrolled, setScrolled] = useState(false);
  const [helpful, setHelpful] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentIdx = FLAT_SECTIONS.findIndex((s) => s.id === activeSection);
  const prev = FLAT_SECTIONS[currentIdx - 1];
  const next = FLAT_SECTIONS[currentIdx + 1];

  const filteredNav = NAV.map((g) => ({
    ...g,
    items: g.items.filter(
      (s) =>
        !searchQuery ||
        s.label.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  })).filter((g) => g.items.length > 0);

  const currentSection = FLAT_SECTIONS.find((s) => s.id === activeSection);

  const renderContent = () => {
    switch (activeSection) {
      case "quickstart":
        return <QuickStart setLang={setLang} lang={lang} />;
      case "api":
        return <ApiReference />;
      case "authentication":
        return <Authentication />;
      case "errors":
        return <Errors />;
      case "sdk":
        return <SdkSection />;
      case "webhooks":
        return <Webhooks />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? "bg-black/70 backdrop-blur-xl border-white/10 py-3" : "bg-transparent border-transparent py-5"}`}
      >
        <div className="container mx-auto max-w-7xl px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              SecureFlow <span className="text-gray-500 font-medium">Docs</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-xs px-3 py-1.5 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20 font-semibold">
              API v2.1
            </span>
            <a
              href="/status"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-6 pt-28 pb-20 flex gap-8">
        {/* Left Sidebar */}
        <aside className="w-60 shrink-0 hidden lg:block">
          <div className="sticky top-28 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
              <input
                type="text"
                placeholder="Search docs…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all"
              />
            </div>

            {/* Nav groups */}
            <nav className="space-y-5">
              {filteredNav.map((group) => (
                <div key={group.group}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 px-2 mb-1.5">
                    {group.group}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                            window.scrollTo({ top: 0 });
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${active ? "bg-blue-600/10 text-blue-400" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
                        >
                          <Icon
                            className={`h-3.5 w-3.5 shrink-0 ${active ? "text-blue-400" : "text-gray-600"}`}
                          />
                          {item.label}
                          {active && (
                            <div className="ml-auto w-1 h-3 rounded-full bg-blue-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="pt-4 border-t border-white/5 space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 px-2 mb-1.5">
                Resources
              </p>
              {[
                {
                  label: "Changelog",
                  icon: FileText,
                  href: "/changelog",
                  external: false,
                },
                {
                  label: "Platform Status",
                  icon: Activity,
                  href: "/status",
                  external: false,
                },
                {
                  label: "API Explorer",
                  icon: Terminal,
                  href: "/docs",
                  external: false,
                  onClick: () => setActiveSection("api"),
                },
                {
                  label: "GitHub",
                  icon: ExternalLink,
                  href: "https://github.com/Sreenu-y/Secure-Flow",
                  external: true,
                },
              ].map((r) => {
                const Icon = r.icon;
                return r.onClick ? (
                  <button
                    key={r.label}
                    onClick={r.onClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:text-gray-400 transition-all text-left rounded-lg hover:bg-white/5"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {r.label}
                  </button>
                ) : (
                  <a
                    key={r.label}
                    href={r.href}
                    target={r.external ? "_blank" : undefined}
                    rel={r.external ? "noopener noreferrer" : undefined}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:text-gray-400 transition-all rounded-lg hover:bg-white/5"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {r.label}
                    {r.external && (
                      <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-8">
            <span>Docs</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-400">
              {
                NAV.find((g) => g.items.some((i) => i.id === activeSection))
                  ?.group
              }
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">{currentSection?.label}</span>
          </div>

          <div
            key={activeSection}
            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            {renderContent()}
          </div>

          {/* Was this helpful? */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white">
                Was this page helpful?
              </p>
              <div className="flex gap-2">
                {helpful === null ? (
                  <>
                    <button
                      onClick={() => setHelpful(true)}
                      className="text-xs px-4 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:border-green-500/40 hover:text-green-400 transition-all"
                    >
                      👍 Yes
                    </button>
                    <button
                      onClick={() => setHelpful(false)}
                      className="text-xs px-4 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:border-red-500/40 hover:text-red-400 transition-all"
                    >
                      👎 No
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    {helpful
                      ? "Thanks for the feedback! 🎉"
                      : "Sorry to hear that. We'll improve it."}
                  </p>
                )}
              </div>
            </div>

            <a
              href="https://github.com/secureflow"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Edit this page on GitHub
            </a>
          </div>

          {/* Prev / Next navigation */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            {prev ? (
              <button
                onClick={() => {
                  setActiveSection(prev.id);
                  window.scrollTo({ top: 0 });
                }}
                className="group flex flex-col gap-1 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left"
              >
                <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                  ← Previous
                </span>
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                  {prev.label}
                </span>
              </button>
            ) : (
              <div />
            )}
            {next ? (
              <button
                onClick={() => {
                  setActiveSection(next.id);
                  window.scrollTo({ top: 0 });
                }}
                className="group flex flex-col gap-1 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-right ml-auto w-full"
              >
                <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                  Next →
                </span>
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                  {next.label}
                </span>
              </button>
            ) : (
              <div />
            )}
          </div>
        </main>

        {/* Right TOC */}
        {currentSection?.toc && (
          <aside className="w-48 shrink-0 hidden xl:block">
            <div className="sticky top-28 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 mb-3">
                On this page
              </p>
              {currentSection.toc.map((item) => {
                const slug = item.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                return (
                  <a
                    key={item}
                    href={`#${slug}`}
                    className="block text-xs text-gray-600 hover:text-gray-300 py-1 border-l border-white/10 pl-3 hover:border-blue-500/50 transition-all"
                  >
                    {item}
                  </a>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="container mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-bold">SecureFlow</span>
            <span className="text-xs text-gray-600 ml-2">© 2025</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              SOC 2
            </a>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
