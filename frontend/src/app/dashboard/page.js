"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, ShieldAlert } from "lucide-react";
import { LiveFeed } from "@/components/dashboard/LiveFeed";
import { useSocket } from "@/hooks/useSocket";
import Link from "next/link";

const QUICK_LINKS = [
  {
    label: "View Transactions",
    href: "/dashboard/transactions",
    desc: "Browse all transaction records",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    desc: "Charts and model metrics",
  },
  {
    label: "Alerts Queue",
    href: "/dashboard/alerts",
    desc: "Review high-risk flags",
  },
];

export default function DashboardOverview() {
  const { transactions } = useSocket({ maxItems: 50, intervalMs: 2500 });

  // Memoize calculations so they don't re-run on every render unless transactions change
  const { totalBlocked, totalAmount, fraudRate } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { totalBlocked: 0, totalAmount: 0, fraudRate: "0.0" };
    }

    const blocked = transactions.filter((t) => t.status === "Blocked").length;
    const amount = transactions.reduce((s, t) => s + (t.amount || 0), 0);
    const fraud = (
      (transactions.filter((t) => t.isFraud).length / transactions.length) *
      100
    ).toFixed(1);

    return { totalBlocked: blocked, totalAmount: amount, fraudRate: fraud };
  }, [transactions]);

  const stats = useMemo(
    () => [
      {
        label: "Live Fraud Rate",
        value: `${fraudRate}%`,
        sub: "of recent transactions",
        icon: ShieldAlert,
        accent: parseFloat(fraudRate) > 10 ? "text-red-400" : "text-green-400",
      },
      {
        label: "Transactions Scanned",
        value: (transactions?.length || 0).toLocaleString(),
        sub: "in current session",
        icon: Activity,
        accent: "text-white",
      },
      {
        label: "Blocked This Session",
        value: totalBlocked,
        sub: "high-risk blocked",
        icon: CreditCard,
        accent: totalBlocked > 0 ? "text-red-400" : "text-green-400",
      },
      {
        label: "Total Volume Screened",
        value: `$${(totalAmount / 1000).toFixed(1)}K`,
        sub: "transaction value",
        icon: DollarSign,
        accent: "text-white",
      },
    ],
    [fraudRate, transactions?.length, totalBlocked, totalAmount],
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold gradient-title tracking-tight">
          Overview
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Welcome back to SecureFlow — live fraud monitoring dashboard.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {s.label}
              </CardTitle>
              <s.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${s.accent}`}>{s.value}</div>
              <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live feed */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <LiveFeed />
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-4">
        {QUICK_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="p-4 rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-900/80 hover:border-gray-700 transition-all group block"
          >
            <div className="text-sm font-semibold text-white group-hover:text-white flex items-center gap-1">
              {l.label}
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">{l.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
