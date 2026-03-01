import mongoose from "mongoose";

const ApiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    hashedKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // E.g., sk_live_..., or sk_test_... to show in UI alongside ••••••••
    prefix: {
      type: String,
      required: true,
    },
    lastUsedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Prevent mongoose from recompiling the model in serverless environment
export default mongoose.models.ApiKey || mongoose.model("ApiKey", ApiKeySchema);
