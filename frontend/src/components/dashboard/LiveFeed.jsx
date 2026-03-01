"use client";
import { useSocket } from "@/hooks/useSocket";
import { ShieldAlert, ShieldCheck, Wifi } from "lucide-react";

function RiskBar({ score }) {
  const pct = Math.round(score * 100);
  const color =
    score > 0.7 ? "bg-red-500" : score > 0.4 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-gray-400 w-8 text-right">
        {pct}%
      </span>
    </div>
  );
}

export function LiveFeed() {
  const { transactions, connected } = useSocket({
    maxItems: 12,
    intervalMs: 5000,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Live Transaction Feed
        </h3>
        <div className="flex items-center gap-1.5 text-xs">
          <Wifi
            className={`h-3.5 w-3.5 ${connected ? "text-green-400" : "text-gray-500"}`}
          />
          <span className={connected ? "text-green-400" : "text-gray-500"}>
            {connected ? "Live" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-xs transition-all animate-in fade-in slide-in-from-top-1 duration-300 ${
              txn.isFraud
                ? "bg-red-950/20 border-red-800/40"
                : "bg-gray-900/60 border-gray-800/60"
            }`}
          >
            {txn.isFraud ? (
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-green-400 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-gray-300 truncate">
                  {txn.id}
                </span>
                <span className="text-gray-500 ml-2 shrink-0">
                  {new Date(txn.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <RiskBar score={txn.riskScore} />
            </div>

            <div className="text-right shrink-0">
              <p className="text-white font-semibold">
                ${txn.amount.toLocaleString()}
              </p>
              <p className="text-gray-500">{txn.type}</p>
            </div>

            <span
              className={`px-2 py-0.5 rounded-full font-medium shrink-0 ${
                txn.status === "Blocked"
                  ? "bg-red-500/15 text-red-400"
                  : txn.status === "Reviewing"
                    ? "bg-yellow-500/15 text-yellow-400"
                    : "bg-green-500/15 text-green-400"
              }`}
            >
              {txn.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
