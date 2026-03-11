"use client";
import { useState } from "react";
import { MOCK_ALERTS } from "@/lib/mockData";
import { ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const SEVERITY_STYLES = {
  Critical: "bg-red-500/20 text-red-400 border-red-800/50",
  High: "bg-orange-500/20 text-orange-400 border-orange-800/50",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-800/50",
};

const STATUS_ICON = {
  New: (
    <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse inline-block" />
  ),
  Reviewing: <Clock className="h-3.5 w-3.5 text-yellow-400" />,
  Escalated: <ShieldAlert className="h-3.5 w-3.5 text-orange-400" />,
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [filter, setFilter] = useState("All");

  const markReviewed = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Reviewing" } : a)),
    );
    toast.success("Alert marked as under review.");
  };

  const filtered =
    filter === "All" ? alerts : alerts.filter((a) => a.severity === filter);
  const newCount = alerts.filter((a) => a.status === "New").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-title tracking-tight">
            Alerts
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            High-risk transaction queue requiring review.
          </p>
        </div>
        {newCount > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-800/50 text-red-400 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
            {newCount} New
          </span>
        )}
      </div>

      {/* Severity filter */}
      <div className="flex gap-2">
        {["All", "Critical", "High", "Medium"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filter === s
                ? "bg-white text-black border-white"
                : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {filtered.map((alert) => (
          <Card
            key={alert.id}
            className={`border ${SEVERITY_STYLES[alert.severity]}`}
          >
            <CardContent className="py-4 px-5">
              <div className="flex items-center gap-4">
                {/* Severity icon */}
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${SEVERITY_STYLES[alert.severity]}`}
                >
                  <ShieldAlert className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-white text-sm font-semibold">
                      {alert.txnId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${SEVERITY_STYLES[alert.severity]}`}
                    >
                      {alert.severity}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      {STATUS_ICON[alert.status]} {alert.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{alert.type}</span>
                    <span className="text-white font-semibold">
                      ${alert.amount.toLocaleString()}
                    </span>
                    <span>
                      Risk:{" "}
                      <span className="font-mono text-red-400">
                        {Math.round(alert.riskScore * 100)}%
                      </span>
                    </span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Action */}
                {alert.status === "New" ? (
                  <button
                    onClick={() => markReviewed(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium transition-colors shrink-0"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Reviewed
                  </button>
                ) : (
                  <span className="text-xs text-gray-600 shrink-0">
                    {alert.status}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-12 text-sm">
            No alerts for this severity level.
          </p>
        )}
      </div>
    </div>
  );
}
