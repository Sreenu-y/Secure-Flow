import mongoose from "mongoose";

const PredictionSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    transactionData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    predictionResult: {
      isFraud: { type: Boolean, required: true },
      fraudProbability: { type: Number, required: true },
      riskLevel: { type: String, required: true },
    },
  },
  { timestamps: true },
);

export default mongoose.models.Prediction ||
  mongoose.model("Prediction", PredictionSchema);
