"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
} from "lucide-react";

const SERVICES = [
  { name: "Fraud Detection API", description: "POST /api/v1/predict" },
  { name: "Batch Processing", description: "POST /api/v1/batch" },
  { name: "Dashboard", description: "Web application" },
  { name: "Authentication", description: "Clerk / OAuth" },
  { name: "Billing & Payments", description: "Stripe integration" },
  { name: "Webhook Delivery", description: "Event notifications" },
];

const INCIDENTS = [
  {
    date: "March 10, 2026",
    title: "Elevated API latency — resolved",
    status: "resolved",
    details:
      "From 09:14 to 09:52 UTC, a subset of /predict requests experienced latency above 500ms due to a cold-start issue in the model inference layer. All requests completed successfully. The issue was resolved by pre-warming the model cache.",
    duration: "38 min",
    affected: ["Fraud Detection API"],
  },
  {
    date: "February 22, 2026",
    title: "Webhook delivery delays — resolved",
    status: "resolved",
    details:
      "From 14:05 to 14:31 UTC, webhook deliveries were delayed by up to 4 minutes due to a queue backpressure issue. No events were lost; all were delivered with delay.",
    duration: "26 min",
    affected: ["Webhook Delivery"],
  },
];

// Fake uptime data — 90 days of bars
function generateUptimeBars() {
  return Array.from({ length: 90 }, (_, i) => {
    const r = Math.random();
    if (i === 10 || i === 36) return "incident"; // match incidents
    if (r > 0.02) return "up";
    return "degraded";
  });
}

function UptimeBar({ bars }) {
  const uptimePct = (
    (bars.filter((b) => b === "up").length / bars.length) *
    100
  ).toFixed(2);
  return (
    <div className="space-y-1.5">
      <div className="flex gap-px">
        {bars.map((bar, i) => (
          <div
            key={i}
            title={
              bar === "up"
                ? "Operational"
                : bar === "incident"
                  ? "Incident"
                  : "Degraded"
            }
            className={`flex-1 h-7 rounded-[2px] transition-opacity hover:opacity-80 cursor-default ${
              bar === "up"
                ? "bg-green-500"
                : bar === "incident"
                  ? "bg-red-500"
                  : "bg-yellow-500"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>90 days ago</span>
        <span className="text-green-400 font-semibold">
          {uptimePct}% uptime
        </span>
        <span>Today</span>
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [bars] = useState(() => generateUptimeBars());
  const [now, setNow] = useState("");

  useEffect(() => {
    setNow(new Date().toUTCString());
  }, []);

  const overall = "operational"; // Could be dynamic

  const overallStyles = {
    operational: {
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
      label: "All Systems Operational",
    },
    degraded: {
      icon: AlertTriangle,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
      label: "Partial Degradation",
    },
    outage: {
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      label: "Major Outage",
    },
  };

  const s = overallStyles[overall];
  const Icon = s.icon;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-white" />
            <span className="font-bold text-white">SecureFlow</span>
          </Link>
          <Link
            href="/docs"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Docs
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-16 space-y-10">
        {/* Overall status */}
        <div
          className={`flex items-center gap-4 p-6 rounded-2xl border ${s.bg}`}
        >
          <Icon className={`h-8 w-8 ${s.color} shrink-0`} />
          <div>
            <p className={`text-xl font-bold ${s.color}`}>{s.label}</p>
            {now && (
              <p className="text-xs text-gray-500 mt-0.5">
                Last updated: {now}
              </p>
            )}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full bg-green-500 ${overall === "operational" ? "animate-pulse" : ""}`}
            />
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>

        {/* Per-service status */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Components</h2>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            {SERVICES.map((svc, i) => (
              <div
                key={svc.name}
                className={`flex items-center justify-between px-5 py-4 ${i !== 0 ? "border-t border-white/5" : ""} hover:bg-white/[0.02] transition-colors`}
              >
                <div>
                  <p className="text-sm font-medium text-white">{svc.name}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {svc.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-400 font-semibold">
                    Operational
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Uptime graph */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-400" />
            Overall Uptime
          </h2>
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
            <UptimeBar bars={bars} />
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-green-500" /> Operational
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-yellow-500" /> Degraded
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-red-500" /> Incident
              </span>
            </div>
          </div>
        </div>

        {/* Incident history */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Past Incidents</h2>
          {INCIDENTS.map((inc, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-white/10 space-y-3"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    {inc.title}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> {inc.date} · Duration:{" "}
                    {inc.duration}
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 whitespace-nowrap">
                  Resolved
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {inc.details}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {inc.affected.map((a) => (
                  <span
                    key={a}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-500"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <p className="text-xs text-gray-600 text-center pt-2">
            No other incidents in the past 90 days.
          </p>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8">
        <div className="container mx-auto max-w-3xl px-6 flex items-center justify-between text-xs text-gray-700">
          <span>© 2026 SecureFlow</span>
          <Link href="/docs" className="hover:text-gray-400 transition-colors">
            ← Back to Docs
          </Link>
        </div>
      </footer>
    </div>
  );
}
