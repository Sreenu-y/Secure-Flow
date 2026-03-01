import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongoose";
import ApiKey from "@/models/ApiKey";

export const dynamic = "force-dynamic";

// Helper function to hash keys
const hashKey = (key) => crypto.createHash("sha256").update(key).digest("hex");

// Get all keys for the current user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    // Fetch user keys, do not return the hash but just metadata
    const keys = await ApiKey.find({ clerkUserId: userId })
      .select("name prefix createdAt lastUsedAt")
      .sort({ createdAt: -1 });

    return NextResponse.json(keys);
  } catch (error) {
    console.error("[KEYS_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// Create a new API key
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, isTest = false } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Generate secure key
    const prefix = isTest ? "sk_test_" : "sk_live_";
    const randomBytes = crypto.randomBytes(32).toString("hex");
    const rawKey = `${prefix}${randomBytes}`;

    // Hash it for secure storage
    const hashedKey = hashKey(rawKey);

    await connectToDatabase();

    const apiKeyData = await ApiKey.create({
      name,
      clerkUserId: userId,
      prefix,
      hashedKey,
    });

    // Return the RAW KEY exactly once to the client, along with the ID and metadata
    return NextResponse.json({
      id: apiKeyData._id.toString(),
      name: apiKeyData.name,
      key: rawKey,
      prefix: apiKeyData.prefix,
      createdAt: apiKeyData.createdAt,
    });
  } catch (error) {
    console.error("[KEYS_POST]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
