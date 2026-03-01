"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FRAUD_RATE_OVER_TIME } from "@/lib/mockData";

export function FraudLineChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={FRAUD_RATE_OVER_TIME}
        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: 8,
          }}
          labelStyle={{ color: "#f9fafb" }}
          formatter={(v) => [`${v}%`, "Fraud Rate"]}
        />
        <Line
          type="monotone"
          dataKey="fraudRate"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ fill: "#f59e0b", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
