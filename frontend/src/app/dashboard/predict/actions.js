"use server";

import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import Prediction from "@/models/Prediction";
import { checkFeatureLimits, incrementUsage } from "@/lib/billing";

const PYTHON_API = process.env.FRAUD_API_URL ?? "http://localhost:8000";

/**
 * Calls the Python fraud-detection model via a server-side proxy
 * and saves the prediction result to MongoDB for logged-in users.
 *
 * @param {Object} txn - Transaction fields matching the model's expected input
 * @returns {{ prediction: number, fraud_probability: number, verdict: string } | { error: string }}
 */
export async function predictTransaction(txn) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "User is not authenticated." };
    }

    const canScan = await checkFeatureLimits(userId, "transactionsScanned");
    if (!canScan) {
      return { error: "Plan limit exceeded for scanning transactions." };
    }

    const res = await fetch(`${PYTHON_API}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(txn),
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: `Model server error (${res.status}): ${text}` };
    }

    const modelData = await res.json();

    // Connect to database
    await connectToDatabase();

    // Determine risk level based on probability
    const prob = modelData.fraud_probability;
    const riskLevel =
      prob > 0.7 ? "High Risk" : prob > 0.4 ? "Medium Risk" : "Low Risk";

    // Save prediction to MongoDB
    await Prediction.create({
      clerkUserId: userId,
      transactionData: txn,
      predictionResult: {
        isFraud: modelData.prediction === 1,
        fraudProbability: modelData.fraud_probability,
        riskLevel: riskLevel,
      },
    });

    await incrementUsage(userId, "transactionsScanned");

    return modelData;
  } catch (err) {
    console.error("Prediction/Save Error:", err);
    return {
      error:
        "Could not reach the Python model server or save to database. Make sure your Python API and MongoDB are running.",
    };
  }
}

/**
 * Fetches the latest 5 predictions for the current logged-in user.
 */
export async function getPreviousPredictions() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    await connectToDatabase();
    const predictions = await Prediction.find({ clerkUserId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Convert MongoDB doc types to plain objects for the client
    return JSON.parse(JSON.stringify(predictions));
  } catch (err) {
    console.error("Fetch Predictions Error:", err);
    return [];
  }
}
