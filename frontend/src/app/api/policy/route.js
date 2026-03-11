import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    fraudThreshold: { type: Number, default: 0.75 },
    highRiskThreshold: { type: Number, default: 0.9 },
    maxTransactionAmount: { type: Number, default: 50000 },
    velocityLimit: { type: Number, default: 10 },
    blockAutomatic: { type: Boolean, default: true },
    reviewQueue: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    webhookAlerts: { type: Boolean, default: false },
    smsAlerts: { type: Boolean, default: false },
    alertOnBlock: { type: Boolean, default: true },
    alertOnHighRisk: { type: Boolean, default: true },
    alertOnModel: { type: Boolean, default: false },
    blockAction: { type: String, default: "flag" },
    retentionDays: { type: Number, default: 90 },
  },
  { timestamps: true },
);

const Policy = mongoose.models.Policy || mongoose.model("Policy", PolicySchema);

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    await connectToDatabase();
    const policy = await Policy.findOne({ clerkUserId: userId }).lean();

    // Return defaults if no saved policy yet
    if (!policy) {
      return NextResponse.json({});
    }

    const { _id, __v, clerkUserId, createdAt, updatedAt, ...settings } = policy;
    return NextResponse.json(settings);
  } catch (err) {
    console.error("[POLICY_GET]", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    await connectToDatabase();

    await Policy.findOneAndUpdate(
      { clerkUserId: userId },
      { ...body, clerkUserId: userId },
      { upsert: true, new: true },
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POLICY_POST]", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
