"""
api.py — FastAPI server for SecureFlow fraud detection
Run with: uvicorn api:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os

app = FastAPI(
    title="SecureFlow Fraud Detection API",
    description="An API to predict fraudulent transactions in real-time using a pre-trained machine learning pipeline.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

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
    step: int = Field(..., description="Maps a unit of time in the real world. In this case 1 step is 1 hour of time.", example=1)
    type: int = Field(..., description="Type of transaction: 0 for TRANSFER, 1 for CASH_OUT.", example=0)
    amount: float = Field(..., description="Amount of the transaction in local currency.", example=9839.64)
    oldbalanceOrg: float = Field(..., description="Initial balance before the transaction.", example=170136.0)
    newbalanceOrig: float = Field(..., description="New balance after the transaction.", example=160296.36)
    oldbalanceDest: float = Field(..., description="Initial balance recipient before the transaction.", example=0.0)
    newbalanceDest: float = Field(..., description="New balance recipient after the transaction.", example=0.0)
    errorBalanceOrig: float = Field(..., description="Difference between expected and actual origin balance.", example=0.0)
    errorBalanceDest: float = Field(..., description="Difference between expected and actual destination balance.", example=9839.64)


class PredictionResponse(BaseModel):
    prediction: int = Field(..., description="1 if Fraudulent, 0 if Legitimate", example=0)
    fraud_probability: float = Field(..., description="Probability of the transaction being fraudulent (0.0 to 1.0)", example=0.0123)
    verdict: str = Field(..., description="String verdict ('FRAUD' or 'LEGITIMATE')", example="LEGITIMATE")


@app.get("/", tags=["Health"])
def root():
    """
    Health check endpoint to verify the API is running.
    """
    return {"status": "ok", "service": "SecureFlow Fraud Detection API"}


@app.post("/predict", tags=["Prediction"], response_model=PredictionResponse)
def predict(txn: Transaction):
    """
    Predict Fraudulent Transactions
    
    Receive a transaction payload, run it through the fraud-detection machine learning pipeline,
    and return the integer prediction along with the fraud probability score.
    
    - **step**: Time step of the transaction 
    - **type**: Transaction type encoded as integer (0 = TRANSFER, 1 = CASH_OUT)
    - **amount**: Value being transferred
    - **oldbalanceOrg**: Originator's old balance
    - **newbalanceOrig**: Originator's new balance
    - **oldbalanceDest**: Destination's old balance
    - **newbalanceDest**: Destination's new balance
    - **errorBalanceOrig**: Calculated error in the originator's balance
    - **errorBalanceDest**: Calculated error in the destination's balance
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
