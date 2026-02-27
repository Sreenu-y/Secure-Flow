"""
api.py — FastAPI server for SecureFlow fraud detection
Run with: uvicorn api:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI(title="SecureFlow Fraud Detection API")

# Allow requests from the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the pre-trained pipeline once at startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), "fraud_detection_pipeline.joblib")
pipeline = joblib.load(MODEL_PATH)
print(f"✓ Pipeline loaded from {MODEL_PATH}")


class Transaction(BaseModel):
    step: int
    type: int               # 0 = TRANSFER, 1 = CASH_OUT
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float
    errorBalanceOrig: float
    errorBalanceDest: float


@app.get("/")
def root():
    return {"status": "ok", "service": "SecureFlow Fraud Detection API"}


@app.post("/predict")
def predict(txn: Transaction):
    """
    Receive a transaction, run it through the fraud-detection pipeline,
    and return the prediction + fraud probability.
    """
    try:
        df = pd.DataFrame([txn.model_dump()])
        prediction    = int(pipeline.predict(df)[0])
        fraud_prob    = float(pipeline.predict_proba(df)[0][1])

        return {
            "prediction":        prediction,        # 1 = Fraud, 0 = Legitimate
            "fraud_probability": round(fraud_prob, 4),
            "verdict":           "FRAUD" if prediction == 1 else "LEGITIMATE",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
