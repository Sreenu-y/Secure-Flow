"use client";
import { useState, useEffect } from "react";
import { predictTransaction, getPreviousPredictions } from "./actions";
import {
  BrainCircuit,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  History,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const TRANSACTION_TYPES = [
  { label: "TRANSFER", value: 0 },
  { label: "CASH_OUT", value: 1 },
];

const DEFAULT_FORM = {
  step: "",
  type: 0,
  amount: "",
  oldbalanceOrg: "",
  newbalanceOrig: "",
  oldbalanceDest: "",
  newbalanceDest: "",
};

export default function PredictPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const data = await getPreviousPredictions();
    setHistory(data);
    setLoadingHistory(false);
  };

  // Auto-compute the two error balance fields from the raw inputs
  const computeErrors = (f) => {
    const amt = parseFloat(f.amount) || 0;
    const oldOrig = parseFloat(f.oldbalanceOrg) || 0;
    const newOrig = parseFloat(f.newbalanceOrig) || 0;
    const oldDest = parseFloat(f.oldbalanceDest) || 0;
    const newDest = parseFloat(f.newbalanceDest) || 0;
    return {
      errorBalanceOrig: newOrig - (oldOrig - amt),
      errorBalanceDest: newDest - (oldDest + amt),
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const { errorBalanceOrig, errorBalanceDest } = computeErrors(form);

    const payload = {
      step: parseInt(form.step) || 1,
      type: parseInt(form.type),
      amount: parseFloat(form.amount) || 0,
      oldbalanceOrg: parseFloat(form.oldbalanceOrg) || 0,
      newbalanceOrig: parseFloat(form.newbalanceOrig) || 0,
      oldbalanceDest: parseFloat(form.oldbalanceDest) || 0,
      newbalanceDest: parseFloat(form.newbalanceDest) || 0,
      errorBalanceOrig,
      errorBalanceDest,
    };

    try {
      const data = await predictTransaction(payload);
      if (data.error) throw new Error(data.error);
      setResult(data);
      // Refresh history after success
      fetchHistory();
    } catch (err) {
      setError(err.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  const { errorBalanceOrig, errorBalanceDest } = computeErrors(form);
  const isFraud = result?.prediction === 1;
  const fraudProb = result ? (result.fraud_probability * 100).toFixed(1) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center">
          <BrainCircuit className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold gradient-title tracking-tight">
            Predict Transaction
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Run a transaction through the fraud detection model in real-time.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Form */}
        <Card className="md:col-span-3 shadow-sm border-gray-800 bg-gray-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base">Transaction Details</CardTitle>
            <CardDescription>
              Enter the transaction fields. Balance error features are computed
              automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Step + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">
                    Step (hour)
                  </label>
                  <input
                    type="number"
                    name="step"
                    min="1"
                    value={form.step}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">
                    Transaction Type
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 transition-colors"
                  >
                    {TRANSACTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">
                  Amount ($)
                </label>
                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="e.g. 5000.00"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
                  required
                />
              </div>

              {/* Sender balances */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Sender
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "oldbalanceOrg", label: "Old Balance" },
                    { name: "newbalanceOrig", label: "New Balance" },
                  ].map((f) => (
                    <div key={f.name} className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400">
                        {f.label} ($)
                      </label>
                      <input
                        type="number"
                        name={f.name}
                        min="0"
                        step="0.01"
                        value={form[f.name]}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Receiver balances */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Receiver
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "oldbalanceDest", label: "Old Balance" },
                    { name: "newbalanceDest", label: "New Balance" },
                  ].map((f) => (
                    <div key={f.name} className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400">
                        {f.label} ($)
                      </label>
                      <input
                        type="number"
                        name={f.name}
                        min="0"
                        step="0.01"
                        value={form[f.name]}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-computed error fields */}
              <div className="rounded-lg bg-gray-950/60 border border-gray-800 p-3 space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Auto-computed features
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">errorBalanceOrig</span>
                    <p
                      className={`font-mono font-semibold mt-0.5 ${errorBalanceOrig !== 0 ? "text-yellow-400" : "text-green-400"}`}
                    >
                      {errorBalanceOrig.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">errorBalanceDest</span>
                    <p
                      className={`font-mono font-semibold mt-0.5 ${errorBalanceDest !== 0 ? "text-yellow-400" : "text-green-400"}`}
                    >
                      {errorBalanceDest.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-white text-black hover:bg-gray-200 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analysing…
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4 mr-2" /> Run Fraud Check
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result panel */}
        <div className="md:col-span-2 space-y-4">
          {/* Result card */}
          {error && (
            <Card className="border-yellow-800/50 bg-yellow-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-300">
                      API Unreachable
                    </p>
                    <p className="text-xs text-yellow-500 mt-1">{error}</p>
                    <p className="text-xs text-gray-500 mt-3">
                      Start the Python API server:
                      <br />
                      <code className="text-gray-400 text-[10px]">
                        uvicorn api:app --reload
                      </code>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card
              className={`border animate-in zoom-in-95 duration-300 ${isFraud ? "border-red-800/60 bg-red-950/20" : "border-green-800/60 bg-green-950/20"}`}
            >
              <CardContent className="pt-6 text-center space-y-4">
                <div
                  className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center ${isFraud ? "bg-red-500/20" : "bg-green-500/20"}`}
                >
                  {isFraud ? (
                    <ShieldAlert className="h-8 w-8 text-red-400" />
                  ) : (
                    <ShieldCheck className="h-8 w-8 text-green-400" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${isFraud ? "text-red-400" : "text-green-400"}`}
                  >
                    {isFraud ? "🚨 FRAUD" : "✅ Legitimate"}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">Model verdict</p>
                </div>

                {/* Probability bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Fraud probability</span>
                    <span className="font-mono font-semibold text-white">
                      {fraudProb}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isFraud ? "bg-red-500" : "bg-green-500"}`}
                      style={{ width: `${fraudProb}%` }}
                    />
                  </div>
                </div>

                <p
                  className={`text-xs rounded-lg px-3 py-2 ${isFraud ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}
                >
                  {isFraud
                    ? "This transaction shows fraud signals. Consider blocking or flagging for manual review."
                    : "This transaction appears legitimate based on balance patterns."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Info card */}
          <Card className="shadow-sm border-gray-800 bg-gray-900/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Model Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-gray-500">
              {[
                { label: "Algorithm", value: "Random Forest (pipeline)" },
                { label: "Trained on", value: "PaySim Mobile Money" },
                { label: "Types covered", value: "TRANSFER, CASH_OUT" },
                { label: "Key signals", value: "Balance discrepancies" },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between border-b border-gray-800/50 pb-1.5 last:border-0 last:pb-0"
                >
                  <span>{r.label}</span>
                  <span className="text-gray-300 font-medium">{r.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Previous Predictions Section */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-gray-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Previous Predictions
          </h2>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/20 overflow-hidden backdrop-blur-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-950/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Prediction</th>
                <th className="px-5 py-3.5">Risk Level</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5 text-right">Time</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loadingHistory ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-4 bg-gray-800/50 rounded-md w-full" />
                    </td>
                  </tr>
                ))
              ) : history.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No predictions found. Submit a transaction to see it here.
                  </td>
                </tr>
              ) : (
                history.map((item) => {
                  const isFraudLog = item.predictionResult.isFraud;
                  const probLog = (
                    item.predictionResult.fraudProbability * 100
                  ).toFixed(1);
                  return (
                    <tr
                      key={item._id}
                      className="group hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {isFraudLog ? (
                            <ShieldAlert className="h-4 w-4 text-red-400" />
                          ) : (
                            <ShieldCheck className="h-4 w-4 text-green-400" />
                          )}
                          <span
                            className={`${isFraudLog ? "text-red-400" : "text-green-400"} font-semibold`}
                          >
                            {isFraudLog ? "FRAUD" : "LEGITIMATE"}
                          </span>
                          <span className="text-[10px] font-mono text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded leading-none italic">
                            {probLog}% prob
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            item.predictionResult.riskLevel === "High Risk"
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : item.predictionResult.riskLevel ===
                                  "Medium Risk"
                                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                : "bg-green-500/10 text-green-500 border border-green-500/20"
                          }`}
                        >
                          {item.predictionResult.riskLevel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-white text-xs">
                        $
                        {item.transactionData.amount?.toLocaleString(
                          undefined,
                          { minimumFractionDigits: 2 },
                        )}
                      </td>
                      <td className="px-5 py-4 text-right text-gray-500 text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <Clock className="h-3 w-3" />
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-[10px] mt-0.5 font-medium opacity-60 uppercase tracking-tighter">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ArrowRight className="h-4 w-4 text-gray-700 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
