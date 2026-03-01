"use client";
import Link from "next/link";
import { useState } from "react";
import { MOCK_TRANSACTIONS } from "@/lib/mockData";
import { Search, ShieldAlert, ShieldCheck, ArrowUpDown } from "lucide-react";

const STATUS_STYLES = {
  Approved: "bg-green-500/15 text-green-400",
  Blocked: "bg-red-500/15 text-red-400",
  Reviewing: "bg-yellow-500/15 text-yellow-400",
};

function RiskBar({ score }) {
  const pct = Math.round(score * 100);
  const color =
    score > 0.7 ? "bg-red-500" : score > 0.4 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="flex items-center gap-2 w-28">
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-gray-400 w-7 text-right">
        {pct}%
      </span>
    </div>
  );
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = MOCK_TRANSACTIONS.filter((t) => {
    const matchSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold gradient-title tracking-tight">
          Transactions
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Browse, search, and inspect transaction records.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by ID or type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Approved", "Blocked", "Reviewing"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                filterStatus === s
                  ? "bg-white text-black border-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900/80 border-b border-gray-800">
            <tr>
              {[
                "Transaction ID",
                "Type",
                "Amount",
                "Risk Score",
                "Status",
                "Time",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filtered.map((txn) => (
              <tr
                key={txn.id}
                className="bg-gray-950/40 hover:bg-gray-900/60 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {txn.isFraud ? (
                      <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-green-400 shrink-0" />
                    )}
                    <span className="font-mono text-gray-300 text-xs">
                      {txn.id}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{txn.type}</td>
                <td className="px-4 py-3 text-white font-semibold">
                  ${txn.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <RiskBar score={txn.riskScore} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[txn.status]}`}
                  >
                    {txn.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(txn.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/transactions/${txn.id}`}
                    className="text-xs text-gray-400 hover:text-white transition-colors underline-offset-2 hover:underline"
                  >
                    Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500 text-sm">
            No transactions match your filters.
          </div>
        )}
      </div>
      <p className="text-xs text-gray-600">
        {filtered.length} transactions shown
      </p>
    </div>
  );
}
