"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_TRANSACTIONS } from "@/lib/mockData";
import { ArrowLeft, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Field({ label, value, mono = false, highlight }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`text-sm font-medium ${highlight || (mono ? "font-mono text-gray-200" : "text-white")}`}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}

export default function TransactionDetailPage() {
  const { id } = useParams();
  const txn = MOCK_TRANSACTIONS.find((t) => t.id === id);

  if (!txn) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <p className="text-gray-400">
          Transaction <code className="text-white">{id}</code> not found.
        </p>
        <Link
          href="/dashboard/transactions"
          className="text-sm text-gray-500 hover:text-white mt-4 inline-block underline"
        >
          ← Back to Transactions
        </Link>
      </div>
    );
  }

  const isFraud = txn.isFraud;
  const fraudPct = Math.round(txn.riskScore * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/transactions"
          className="h-8 w-8 rounded-md bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white font-mono">{txn.id}</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {new Date(txn.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Verdict banner */}
      <div
        className={`rounded-xl border p-4 flex items-center gap-4 ${
          isFraud
            ? "bg-red-950/25 border-red-800/50"
            : "bg-green-950/20 border-green-800/50"
        }`}
      >
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center ${isFraud ? "bg-red-500/20" : "bg-green-500/20"}`}
        >
          {isFraud ? (
            <ShieldAlert className="h-6 w-6 text-red-400" />
          ) : (
            <ShieldCheck className="h-6 w-6 text-green-400" />
          )}
        </div>
        <div className="flex-1">
          <p
            className={`text-lg font-bold ${isFraud ? "text-red-400" : "text-green-400"}`}
          >
            {isFraud ? "🚨 FRAUD DETECTED" : "✅ Legitimate Transaction"}
          </p>
          <p className="text-gray-400 text-sm mt-0.5">
            Status: <span className="text-white font-medium">{txn.status}</span>
          </p>
        </div>
        {/* Risk gauge */}
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Fraud Probability</p>
          <p
            className={`text-3xl font-bold font-mono ${isFraud ? "text-red-400" : "text-green-400"}`}
          >
            {fraudPct}%
          </p>
          <div className="h-2 w-32 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${isFraud ? "bg-red-500" : "bg-green-500"}`}
              style={{ width: `${fraudPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Transaction basics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Transaction Basics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Type" value={txn.type} />
            <Field
              label="Amount"
              value={`$${txn.amount.toLocaleString()}`}
              highlight="text-white font-bold"
            />
          </CardContent>
        </Card>

        {/* Sender */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sender Account</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field
              label="Old Balance"
              value={`$${txn.oldbalanceOrg.toLocaleString()}`}
              mono
            />
            <Field
              label="New Balance"
              value={`$${txn.newbalanceOrig.toLocaleString()}`}
              mono
            />
          </CardContent>
        </Card>

        {/* Receiver */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Receiver Account</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field
              label="Old Balance"
              value={`$${txn.oldbalanceDest.toLocaleString()}`}
              mono
            />
            <Field
              label="New Balance"
              value={`$${txn.newbalanceDest.toLocaleString()}`}
              mono
            />
          </CardContent>
        </Card>

        {/* Model features */}
        <Card
          className={
            txn.errorBalanceOrig !== 0 || txn.errorBalanceDest !== 0
              ? "border-yellow-800/50"
              : ""
          }
        >
          <CardHeader>
            <CardTitle className="text-sm">Balance Discrepancies</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field
              label="errorBalanceOrig"
              value={txn.errorBalanceOrig.toFixed(2)}
              mono
              highlight={
                txn.errorBalanceOrig !== 0
                  ? "font-mono text-yellow-400"
                  : "font-mono text-green-400"
              }
            />
            <Field
              label="errorBalanceDest"
              value={txn.errorBalanceDest.toFixed(2)}
              mono
              highlight={
                txn.errorBalanceDest !== 0
                  ? "font-mono text-yellow-400"
                  : "font-mono text-green-400"
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
