"""
test_model.py
=============
Load the saved fraud detection pipeline and test it with sample transactions.
No training required — just loads fraud_detection_pipeline.joblib and predicts.
"""

import joblib
import pandas as pd

# ── Load the saved pipeline ────────────────────────────────────────────────────
print("Loading pipeline …")
pipeline = joblib.load("fraud_detection_pipeline.joblib")
print("✓ Pipeline loaded.\n")


# ── Define sample transactions ─────────────────────────────────────────────────
# Columns must match exactly what the model was trained on (after preprocessing):
#   step, type (0=TRANSFER,1=CASH_OUT), amount,
#   oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest,
#   errorBalanceOrig, errorBalanceDest

sample_transactions = pd.DataFrame([
    {
        # ✅ LEGITIMATE TRANSFER — balances add up perfectly
        "step": 10,
        "type": 0,                  # TRANSFER
        "amount": 5000.00,
        "oldbalanceOrg": 20000.00,
        "newbalanceOrig": 15000.00,  # 20000 - 5000 = 15000 ✓
        "oldbalanceDest": 3000.00,
        "newbalanceDest": 8000.00,   # 3000 + 5000 = 8000 ✓
        "errorBalanceOrig": 0.0,     # no discrepancy
        "errorBalanceDest": 0.0,     # no discrepancy
    },
    {
        # 🚨 SUSPICIOUS CASH_OUT — sender balance doesn't change after transaction
        # (classic PaySim fraud pattern: money leaves but balance stays the same)
        "step": 200,
        "type": 1,                  # CASH_OUT
        "amount": 181987.00,
        "oldbalanceOrg": 181987.00,
        "newbalanceOrig": 0.00,      # goes to zero as expected ...
        "oldbalanceDest": 0.00,      # ... but receiver starts AND stays at 0
        "newbalanceDest": 0.00,      # ← suspicious
        "errorBalanceOrig": 0.0,
        "errorBalanceDest": -181987.00,  # large discrepancy on receiver side
    },
    {
        # 🚨 FRAUDULENT TRANSFER — sender balance does NOT decrease after sending
        "step": 350,
        "type": 0,                  # TRANSFER
        "amount": 250000.00,
        "oldbalanceOrg": 250000.00,
        "newbalanceOrig": 250000.00,  # balance unchanged despite sending ← fraud signal
        "oldbalanceDest": 0.00,
        "newbalanceDest": 0.00,
        "errorBalanceOrig": 250000.00,   # large discrepancy on sender side
        "errorBalanceDest": -250000.00,  # large discrepancy on receiver side
    },
    {
        # ✅ SMALL LEGITIMATE CASH_OUT — ATM withdrawal, balances correct
        "step": 5,
        "type": 1,                  # CASH_OUT
        "amount": 200.00,
        "oldbalanceOrg": 1500.00,
        "newbalanceOrig": 1300.00,   # 1500 - 200 = 1300 ✓
        "oldbalanceDest": 0.00,      # ATM — dest balance irrelevant
        "newbalanceDest": 0.00,
        "errorBalanceOrig": 0.0,
        "errorBalanceDest": -200.0,  # ATM cash-outs normally show this
    },
])

labels = [
    "Legitimate TRANSFER",
    "Suspicious CASH_OUT",
    "Fraudulent TRANSFER",
    "Legitimate CASH_OUT (ATM)",
]

# ── Run predictions ────────────────────────────────────────────────────────────
predictions  = pipeline.predict(sample_transactions)
probabilities = pipeline.predict_proba(sample_transactions)[:, 1]  # fraud probability

# ── Display results ────────────────────────────────────────────────────────────
print("=" * 62)
print(f"  {'Transaction':<28} {'Prediction':<14} {'Fraud Prob':>10}")
print("=" * 62)

for label, pred, prob in zip(labels, predictions, probabilities):
    verdict = "🚨 FRAUD"     if pred == 1 else "✅ Legitimate"
    bar     = "█" * int(prob * 30)
    print(f"  {label:<28} {verdict:<14} {prob:>8.2%}  {bar}")

print("=" * 62)
print("\n  Prediction key: 1 = Fraud  |  0 = Legitimate")
print("  Fraud probability closer to 1.0 = higher risk\n")
