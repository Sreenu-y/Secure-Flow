import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongoose";
import ApiKey from "@/models/ApiKey";
import Prediction from "@/models/Prediction";
import { checkFeatureLimits, incrementUsage } from "@/lib/billing";

const PYTHON_API = process.env.FRAUD_API_URL ?? "http://localhost:8000";

const hashKey = (key) => crypto.createHash("sha256").update(key).digest("hex");

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid Authorization header. Expected 'Bearer <API_KEY>'",
        },
        { status: 401 },
      );
    }

    const rawKey = authHeader.split(" ")[1];
    if (!rawKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 401 },
      );
    }

    const hashedKey = hashKey(rawKey);

    await connectToDatabase();

    // Verify API key
    const apiKeyDoc = await ApiKey.findOne({ hashedKey });
    if (!apiKeyDoc) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const userId = apiKeyDoc.clerkUserId;

    // Check billing limits
    const canScan = await checkFeatureLimits(userId, "transactionsScanned");
    if (!canScan) {
      return NextResponse.json(
        { error: "Plan limit exceeded for scanning transactions." },
        { status: 403 },
      );
    }

    const body = await req.json();

    // Validate request body loosely based on requirements
    const requiredFields = [
      "step",
      "type",
      "amount",
      "oldbalanceOrg",
      "newbalanceOrig",
      "oldbalanceDest",
      "newbalanceDest",
      "errorBalanceOrig",
      "errorBalanceDest",
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    // Proxy to Python Model Server
    const res = await fetch(`${PYTHON_API}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Model server error: ${text}` },
        { status: 502 },
      );
    }

    const modelData = await res.json();

    // Save Prediction in DB
    const prob = modelData.fraud_probability;
    const riskLevel =
      prob > 0.7 ? "High Risk" : prob > 0.4 ? "Medium Risk" : "Low Risk";

    await Prediction.create({
      clerkUserId: userId,
      transactionData: body,
      predictionResult: {
        isFraud: modelData.prediction === 1,
        fraudProbability: modelData.fraud_probability,
        riskLevel: riskLevel,
      },
    });

    // Increment Usage limits
    await incrementUsage(userId, "transactionsScanned");

    // Update API Key lastUsedAt timestamp
    apiKeyDoc.lastUsedAt = new Date();
    await apiKeyDoc.save();

    return NextResponse.json(modelData);
  } catch (error) {
    console.error("[API_V1_PREDICT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
