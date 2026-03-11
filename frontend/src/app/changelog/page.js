"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Zap,
  Shield,
  Wrench,
} from "lucide-react";

const CHANGELOG = [
  {
    version: "2.1.0",
    date: "March 10, 2026",
    tag: "Latest",
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    changes: [
      {
        type: "feature",
        text: "Annual billing support — save 20% with yearly subscriptions",
      },
      {
        type: "feature",
        text: "Policy settings now persisted to MongoDB per user",
      },
      { type: "feature", text: "Mobile-responsive sidebar drawer navigation" },
      {
        type: "fix",
        text: "Billing period now dynamically computed from subscription expiry",
      },
      {
        type: "fix",
        text: "Unlimited plan limits now display ∞ instead of 999999",
      },
      {
        type: "fix",
        text: "API key usage chart empty state no longer shows infinite loader",
      },
    ],
  },
  {
    version: "2.0.0",
    date: "February 28, 2026",
    tag: "Major",
    tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    changes: [
      {
        type: "feature",
        text: "API key management — create, view, revoke live and test keys",
      },
      {
        type: "feature",
        text: "Stripe billing integration with Pro and Enterprise plans",
      },
      {
        type: "feature",
        text: "Real-time websocket transaction feed on the dashboard",
      },
      {
        type: "feature",
        text: "Prediction history saved to MongoDB and displayed in UI",
      },
      {
        type: "improvement",
        text: "Fraud detection model upgraded to Random Forest v2 (AUC-ROC 0.9986)",
      },
    ],
  },
  {
    version: "1.2.0",
    date: "February 15, 2026",
    tag: "Minor",
    tagColor: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    changes: [
      {
        type: "feature",
        text: "Analytics dashboard with fraud rate charts and model metrics",
      },
      {
        type: "feature",
        text: "Alert management page with severity filtering",
      },
      {
        type: "fix",
        text: "CORS headers now correctly restricted to configured origins",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "January 20, 2026",
    tag: "Initial",
    tagColor: "bg-green-500/10 text-green-400 border-green-500/20",
    changes: [
      {
        type: "feature",
        text: "Initial release of SecureFlow fraud detection API",
      },
      { type: "feature", text: "FastAPI model server with /predict endpoint" },
      { type: "feature", text: "Next.js dashboard with Clerk authentication" },
      {
        type: "feature",
        text: "Predict transaction page with real-time scoring",
      },
    ],
  },
];

const TYPE_STYLES = {
  feature: {
    icon: Zap,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    label: "Feature",
  },
  fix: {
    icon: Wrench,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    label: "Fix",
  },
  improvement: {
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/10",
    label: "Improvement",
  },
  security: {
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "Security",
  },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
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

      <main className="container mx-auto max-w-4xl px-6 py-16 space-y-4">
        <div className="space-y-2 mb-12">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
            <Tag className="h-4 w-4" /> Changelog
          </div>
          <h1 className="text-4xl font-bold text-white">What&apos;s new</h1>
          <p className="text-gray-400">
            New features, bug fixes, and improvements to SecureFlow.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[7.5rem] top-0 bottom-0 w-px bg-white/10 hidden sm:block" />

          <div className="space-y-12">
            {CHANGELOG.map((release) => (
              <div key={release.version} className="sm:flex gap-8">
                {/* Date column */}
                <div className="sm:w-28 sm:text-right shrink-0 mb-4 sm:mb-0 pt-0.5">
                  <p className="text-xs text-gray-600 font-mono whitespace-nowrap">
                    {release.date}
                  </p>
                </div>

                {/* Dot */}
                <div className="hidden sm:flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-gray-700 border border-gray-600 mt-1 z-10" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4 pb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-white font-mono">
                      v{release.version}
                    </h2>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-widest ${release.tagColor}`}
                    >
                      {release.tag}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {release.changes.map((change, i) => {
                      const s = TYPE_STYLES[change.type] || TYPE_STYLES.feature;
                      const Icon = s.icon;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md ${s.bg} ${s.color} font-bold uppercase tracking-wide shrink-0 mt-0.5`}
                          >
                            <Icon className="h-3 w-3" /> {s.label}
                          </span>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {change.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="container mx-auto max-w-4xl px-6 flex items-center justify-between text-xs text-gray-700">
          <span>© 2026 SecureFlow</span>
          <Link href="/docs" className="hover:text-gray-400 transition-colors">
            ← Back to Docs
          </Link>
        </div>
      </footer>
    </div>
  );
}
