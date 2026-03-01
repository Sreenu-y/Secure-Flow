"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  CreditCard,
  CheckCircle2,
  Zap,
  Building2,
  Download,
  BadgeCheck,
  TrendingUp,
  Activity,
  Loader2,
} from "lucide-react";

import {
  createCheckoutSession,
  createBillingPortalSession,
  getBillingInfo,
  verifyCheckoutSession,
} from "./actions";
const SERVER_PLANS = {
  free: {
    name: "Free",
    apiCallsLimit: 5000,
    transactionsScannedLimit: 10000,
  },
  pro: {
    name: "Pro",
    apiCallsLimit: 100000,
    transactionsScannedLimit: 500000,
  },
  custom: {
    name: "Custom",
    apiCallsLimit: Infinity,
    transactionsScannedLimit: Infinity,
  },
};

const BASE_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/ month",
    icon: Activity,
    color: "text-gray-400",
    border: "border-gray-700",
    badge: null,
    features: [
      "5,000 API calls / month",
      "10,000 transactions scanned",
      "Basic fraud detection",
      "Email alerts",
      "Community support",
    ],
    cta: "Current Plan",
    planId: "free",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/ month",
    icon: Zap,
    color: "text-blue-400",
    border: "border-blue-500/40",
    badge: "Most Popular",
    features: [
      "100,000 API calls / month",
      "500,000 transactions scanned",
      "Advanced ML models",
      "Real-time webhooks",
      "Priority support",
      "Custom alert rules",
      "Analytics dashboard",
    ],
    cta: "Upgrade to Pro",
    planId: "pro",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    icon: Building2,
    color: "text-purple-400",
    border: "border-purple-500/40",
    badge: "Best Value",
    features: [
      "Unlimited API calls",
      "Unlimited transactions",
      "Custom ML model training",
      "Dedicated infrastructure",
      "SLA guarantee (99.99%)",
      "24/7 dedicated support",
      "On-premise deployment",
      "GDPR / SOC 2 compliance",
    ],
    cta: "Contact Sales",
    planId: "custom",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/ month",
    icon: Activity,
    color: "text-gray-400",
    border: "border-gray-700",
    badge: null,
    features: [
      "5,000 API calls / month",
      "10,000 transactions scanned",
      "Basic fraud detection",
      "Email alerts",
      "Community support",
    ],
    cta: "Current Plan",
    current: true,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/ month",
    icon: Zap,
    color: "text-blue-400",
    border: "border-blue-500/40",
    badge: "Most Popular",
    features: [
      "100,000 API calls / month",
      "500,000 transactions scanned",
      "Advanced ML models",
      "Real-time webhooks",
      "Priority support",
      "Custom alert rules",
      "Analytics dashboard",
    ],
    cta: "Upgrade to Pro",
    current: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    icon: Building2,
    color: "text-purple-400",
    border: "border-purple-500/40",
    badge: "Best Value",
    features: [
      "Unlimited API calls",
      "Unlimited transactions",
      "Custom ML model training",
      "Dedicated infrastructure",
      "SLA guarantee (99.99%)",
      "24/7 dedicated support",
      "On-premise deployment",
      "GDPR / SOC 2 compliance",
    ],
    cta: "Contact Sales",
    current: false,
  },
];

const USAGE_STATS = [
  { label: "API Calls", used: 3241, total: 5000, color: "#3b82f6" },
  { label: "Transactions Scanned", used: 8120, total: 10000, color: "#a855f7" },
  { label: "Alerts Triggered", used: 47, total: 100, color: "#f59e0b" },
];

const BILLING_HISTORY = [
  {
    date: "Feb 1, 2026",
    description: "Free Plan — Monthly",
    amount: "$0.00",
    status: "Paid",
  },
  {
    date: "Jan 1, 2026",
    description: "Free Plan — Monthly",
    amount: "$0.00",
    status: "Paid",
  },
  {
    date: "Dec 1, 2025",
    description: "Free Plan — Monthly",
    amount: "$0.00",
    status: "Paid",
  },
];

function UsageMeter({ label, used, total, color }) {
  const pct = Math.min((used / total) * 100, 100);
  const danger = pct > 80;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span
          className={`font-mono font-semibold ${danger ? "text-red-400" : "text-gray-300"}`}
        >
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: danger ? "#ef4444" : color,
          }}
        />
      </div>
      <p className="text-xs text-gray-600">
        {pct.toFixed(1)}% used this billing cycle
      </p>
    </div>
  );
}

export default function BillingPage() {
  const [annual, setAnnual] = useState(false);
  const [isPending, startTransition] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const [billingInfo, setBillingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    const fetchInfo = () => {
      getBillingInfo().then((info) => {
        setBillingInfo(info);
        setIsLoading(false);
      });
    };

    if (sessionId) {
      verifyCheckoutSession(sessionId).then(() => {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        fetchInfo();
      });
    } else {
      fetchInfo();
    }
  }, []);

  const handleCheckout = (planId) => {
    if (billingInfo?.plan === "custom" && planId === "custom") {
      handleBillingPortal();
      return;
    }
    setLoadingPlan(planId);
    startTransition(true);

    const planType =
      planId.toLowerCase() === "enterprise" ? "custom" : planId.toLowerCase();

    createCheckoutSession(planType)
      .then(({ url }) => {
        if (url) window.location.href = url;
      })
      .catch((err) => {
        console.error("Failed to start checkout:", err);
      })
      .finally(() => {
        setLoadingPlan(null);
        startTransition(false);
      });
  };

  const handleBillingPortal = () => {
    startTransition(true);
    createBillingPortalSession()
      .then(({ url }) => {
        if (url) window.location.href = url;
      })
      .catch((err) => {
        console.error("Portal error:", err);
      })
      .finally(() => startTransition(false));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const userPlan = billingInfo?.plan || "free";
  // Dynamically map current plan
  const plans = BASE_PLANS.map((p) => ({
    ...p,
    current:
      p.planId === userPlan ||
      (p.planId === "custom" && userPlan === "enterprise"),
    cta: p.planId === userPlan ? "Current Plan" : p.cta,
  }));

  const serverLimit = SERVER_PLANS[userPlan] || SERVER_PLANS.free;

  const usageStats = [
    {
      label: "API Calls",
      used: billingInfo?.usage?.apiCalls || 0,
      total:
        serverLimit.apiCallsLimit === Infinity
          ? 999999
          : serverLimit.apiCallsLimit,
      color: "#3b82f6",
    },
    {
      label: "Transactions Scanned",
      used: billingInfo?.usage?.transactionsScanned || 0,
      total:
        serverLimit.transactionsScannedLimit === Infinity
          ? 999999
          : serverLimit.transactionsScannedLimit,
      color: "#a855f7",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-title tracking-tight">
            Billing
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage your subscription plan, usage, and payment details.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-700 rounded-lg p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
              !annual
                ? "bg-white/10 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
              annual
                ? "bg-white/10 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Annual{" "}
            <span className="ml-1 bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
              −20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const displayPrice =
            annual && plan.price !== "$0" && plan.price !== "Custom"
              ? `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}`
              : plan.price;

          return (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 flex flex-col gap-5 transition-all duration-300 ${
                plan.current
                  ? "bg-gray-900/60 " + plan.border
                  : "bg-gray-900/30 " + plan.border + " hover:bg-gray-900/50"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {plan.badge}
                </span>
              )}

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <Icon className={`h-5 w-5 ${plan.color}`} />
                </div>
                <div>
                  <p className="font-bold text-white">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-extrabold ${plan.color}`}>
                      {annual && plan.price !== "$0" && plan.price !== "Custom"
                        ? displayPrice
                        : plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs text-gray-500">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-gray-400"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.planId)}
                className={`w-full mt-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  plan.current
                    ? "bg-white/10 text-gray-400 cursor-default"
                    : plan.name === "Pro"
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                } ${isPending ? "opacity-70 pointer-events-none" : ""}`}
                disabled={plan.current || isPending}
              >
                {loadingPlan === plan.planId ? (
                  <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                ) : plan.current ? (
                  <BadgeCheck className="inline h-4 w-4 mr-1.5 text-green-400" />
                ) : null}
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Current Usage */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <CardTitle className="text-sm">Current Usage</CardTitle>
          </div>
          <CardDescription>
            Billing period: Feb 1 – Feb 28, 2026 · Resets in 2 days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {usageStats.map((s) => (
            <UsageMeter key={s.label} {...s} />
          ))}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <CardTitle className="text-sm">Payment Method</CardTitle>
          </div>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-800 rounded-md">
                <CreditCard className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {billingInfo?.stripeCustomerId
                    ? "Card on file (via Stripe)"
                    : "No payment method on file"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {userPlan === "free"
                    ? "Free plan — no payment required"
                    : "Manage in billing portal"}
                </p>
              </div>
            </div>
            <button
              onClick={handleBillingPortal}
              disabled={isPending}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Manage Billing
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm">Billing History</CardTitle>
            </div>
            <button className="text-xs text-gray-500 hover:text-white transition-colors">
              Download all
            </button>
          </div>
          <CardDescription>Past invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {["Date", "Description", "Amount", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="pb-2 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider last:text-right"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {billingInfo?.paymentHistory?.length > 0 ? (
                billingInfo.paymentHistory.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-900/40 transition-colors"
                  >
                    <td className="py-3 text-gray-500 text-xs">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-gray-300">
                      Invoice {row.invoiceId || "Sub"}
                    </td>
                    <td className="py-3 font-mono text-gray-300">
                      ${row.amount} {row.currency.toUpperCase()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${row.status === "paid" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-4 text-center text-gray-500 text-xs"
                  >
                    No billing history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
