// Shared mock data for analytics, charts, and alerts

export const FRAUD_BY_TYPE = [
  { type: "TRANSFER", legitimate: 4210, fraud: 312 },
  { type: "CASH_OUT", legitimate: 3780, fraud: 498 },
];

export const FRAUD_RATE_OVER_TIME = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  fraudRate: +(Math.random() * 4 + 0.5).toFixed(2),
  blockedAmount: Math.floor(Math.random() * 200000 + 50000),
}));

export const MODEL_METRICS = [
  { metric: "AUPRC", randomForest: 0.9512, gradientBoosting: 0.9634 },
  { metric: "Macro F1", randomForest: 0.9201, gradientBoosting: 0.9388 },
  { metric: "Fraud Recall", randomForest: 0.9105, gradientBoosting: 0.931 },
  { metric: "Fraud Precision", randomForest: 0.8877, gradientBoosting: 0.9021 },
];

export const TYPE_SPLIT = [
  { name: "TRANSFER", value: 4522 },
  { name: "CASH_OUT", value: 4278 },
];

const ALERT_STATUSES = ["New", "Reviewing", "Escalated"];
export const MOCK_ALERTS = Array.from({ length: 12 }, (_, i) => ({
  id: `ALT-${1000 + i}`,
  txnId: `TXN-${90000 + i * 137}`,
  type: i % 2 === 0 ? "CASH_OUT" : "TRANSFER",
  amount: +(Math.random() * 80000 + 5000).toFixed(2),
  riskScore: +(Math.random() * 0.3 + 0.7).toFixed(3),
  severity: i % 3 === 0 ? "Critical" : i % 3 === 1 ? "High" : "Medium",
  status: ALERT_STATUSES[i % 3],
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
}));

export const MOCK_TRANSACTIONS = Array.from({ length: 30 }, (_, i) => {
  const isFraud = i % 7 === 0;
  const type = i % 2 === 0 ? "TRANSFER" : "CASH_OUT";
  const amount = +(Math.random() * 50000 + 200).toFixed(2);
  const oldOrig = +(amount + Math.random() * 50000).toFixed(2);
  const newOrig = +(oldOrig - amount).toFixed(2);
  const oldDest = +(Math.random() * 20000).toFixed(2);
  const newDest = isFraud ? oldDest : +(oldDest + amount).toFixed(2);
  return {
    id: `TXN-${10000 + i * 137}`,
    type,
    amount,
    oldbalanceOrg: oldOrig,
    newbalanceOrig: newOrig,
    oldbalanceDest: oldDest,
    newbalanceDest: newDest,
    errorBalanceOrig: +(newOrig - (oldOrig - amount)).toFixed(2),
    errorBalanceDest: +(newDest - (oldDest + amount)).toFixed(2),
    riskScore: isFraud
      ? +(Math.random() * 0.3 + 0.7).toFixed(3)
      : +(Math.random() * 0.35).toFixed(3),
    status: isFraud ? "Blocked" : i % 5 === 0 ? "Reviewing" : "Approved",
    isFraud,
    timestamp: new Date(Date.now() - i * 600000).toISOString(),
  };
});
