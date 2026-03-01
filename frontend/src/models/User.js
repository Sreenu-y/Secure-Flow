import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "custom", "enterprise"],
      default: "free",
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
    subscriptionExpiryDate: {
      type: Date,
    },
    usage: {
      apiCalls: { type: Number, default: 0 },
      transactionsScanned: { type: Number, default: 0 },
    },
    paymentHistory: [
      {
        amount: Number,
        currency: String,
        status: String,
        invoiceId: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// Prevent mongoose from recompiling the model in serverless environment
export default mongoose.models.User || mongoose.model("User", UserSchema);
