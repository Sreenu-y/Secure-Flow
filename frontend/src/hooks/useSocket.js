"use client";
import { useEffect, useRef, useState } from "react";

const TYPES = ["TRANSFER", "CASH_OUT"];
const STATUSES = ["Approved", "Approved", "Approved", "Blocked", "Reviewing"];

function randomTxn() {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];
  const amount = +(Math.random() * 50000 + 100).toFixed(2);
  const oldOrig = +(Math.random() * 100000 + amount).toFixed(2);
  const newOrig = +(oldOrig - amount).toFixed(2);
  const fraudulent = Math.random() < 0.15;
  const oldDest = +(Math.random() * 20000).toFixed(2);
  const newDest = fraudulent ? oldDest : +(oldDest + amount).toFixed(2);
  const status = fraudulent
    ? "Blocked"
    : STATUSES[Math.floor(Math.random() * STATUSES.length)];
  const riskScore = fraudulent
    ? +(Math.random() * 0.3 + 0.7).toFixed(3)
    : +(Math.random() * 0.35).toFixed(3);

  return {
    id: `TXN-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    type,
    amount,
    oldbalanceOrg: oldOrig,
    newbalanceOrig: newOrig,
    oldbalanceDest: oldDest,
    newbalanceDest: newDest,
    errorBalanceOrig: +(newOrig - (oldOrig - amount)).toFixed(2),
    errorBalanceDest: +(newDest - (oldDest + amount)).toFixed(2),
    riskScore,
    status,
    isFraud: fraudulent,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Simulates real-time transaction events.
 * Replace the setInterval body with a real WebSocket listener to go live:
 *
 *   const ws = new WebSocket("ws://localhost:8000/ws/transactions");
 *   ws.onmessage = (e) => { const txn = JSON.parse(e.data); setTransactions(...) }
 */
export function useSocket({ maxItems = 50, intervalMs = 2000 } = {}) {
  const [transactions, setTransactions] = useState(() =>
    Array.from({ length: 8 }, randomTxn),
  );
  const [connected, setConnected] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    setConnected(true);
    intervalRef.current = setInterval(() => {
      const newTxn = randomTxn();
      setTransactions((prev) => [newTxn, ...prev].slice(0, maxItems));
    }, intervalMs);

    return () => clearInterval(intervalRef.current);
  }, [maxItems, intervalMs]);

  return { transactions, connected };
}
