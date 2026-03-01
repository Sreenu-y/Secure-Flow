"use client";
import { FraudBarChart } from "@/components/charts/FraudBarChart";
import { FraudLineChart } from "@/components/charts/FraudLineChart";
import { TypePieChart } from "@/components/charts/TypePieChart";
import { MODEL_METRICS } from "@/lib/mockData";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function MetricBadge({ value, best }) {
  return (
    <span
      className={`font-mono text-sm font-bold ${value === best ? "text-green-400" : "text-gray-300"}`}
    >
      {value.toFixed(4)}
      {value === best ? " ✦" : ""}
    </span>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold gradient-title tracking-tight">
          Analytics
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Model performance metrics and transaction distribution.
        </p>
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">
              Fraud vs Legitimate by Type
            </CardTitle>
            <CardDescription>TRANSFER and CASH_OUT breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <FraudBarChart />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Transaction Type Split</CardTitle>
            <CardDescription>
              Overall TRANSFER vs CASH_OUT volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TypePieChart />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">Fraud Rate Over Time</CardTitle>
          <CardDescription>14-day fraud rate percentage trend</CardDescription>
        </CardHeader>
        <CardContent>
          <FraudLineChart />
        </CardContent>
      </Card>

      {/* Model comparison table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm">
            Model Performance Comparison
          </CardTitle>
          <CardDescription>
            Random Forest vs Gradient Boosting — trained on PaySim dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-2 text-left text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  Metric
                </th>
                <th className="py-2 text-right text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  Random Forest
                </th>
                <th className="py-2 text-right text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  Gradient Boosting
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {MODEL_METRICS.map((row) => {
                const best = Math.max(row.randomForest, row.gradientBoosting);
                return (
                  <tr
                    key={row.metric}
                    className="hover:bg-gray-900/40 transition-colors"
                  >
                    <td className="py-3 text-gray-300">{row.metric}</td>
                    <td className="py-3 text-right">
                      <MetricBadge value={row.randomForest} best={best} />
                    </td>
                    <td className="py-3 text-right">
                      <MetricBadge value={row.gradientBoosting} best={best} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-600 mt-3">
            ✦ = Best score for that metric
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
