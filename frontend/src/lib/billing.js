import { stripe } from "./stripe";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongoose";

export const PLANS = {
  free: {
    name: "Free",
    apiCallsLimit: 5000,
    transactionsScannedLimit: 10000,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    apiCallsLimit: 100000,
    transactionsScannedLimit: 500000,
  },
  custom: {
    name: "Custom",
    apiCallsLimit: Infinity,
    transactionsScannedLimit: Infinity,
  },
};

export async function checkFeatureLimits(clerkId, feature) {
  await connectToDatabase();
  const user = await User.findOne({ clerkId });
  if (!user) return false;

  const plan = PLANS[user.plan] || PLANS.free;

  if (feature === "apiCalls") {
    return (user.usage?.apiCalls || 0) < plan.apiCallsLimit;
  }

  if (feature === "transactionsScanned") {
    return (
      (user.usage?.transactionsScanned || 0) < plan.transactionsScannedLimit
    );
  }

  return true;
}

export async function incrementUsage(clerkId, feature, amount = 1) {
  await connectToDatabase();
  const incParams = {};
  if (feature === "apiCalls") incParams["usage.apiCalls"] = amount;
  if (feature === "transactionsScanned")
    incParams["usage.transactionsScanned"] = amount;

  await User.findOneAndUpdate({ clerkId }, { $inc: incParams }, { new: true });
}

// Function to generate checkout session url
export async function createCheckoutSession(
  clerkId,
  planType,
  successUrl,
  cancelUrl,
) {
  await connectDB();
  const user = await User.findOne({ clerkId });
  if (!user) throw new Error("User not found");

  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: { clerkId },
    });
    stripeCustomerId = customer.id;
    user.stripeCustomerId = stripeCustomerId;
    await user.save();
  }

  let sessionParams = {
    customer: stripeCustomerId,
    payment_method_types: ["card"],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: clerkId,
    metadata: {
      clerkId,
      planType,
    },
  };

  if (planType === "pro") {
    sessionParams.line_items = [
      {
        price: process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      },
    ];
  } else if (planType === "custom") {
    sessionParams.line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Custom Plan",
          },
          unit_amount: 50000, // 500 default or prompt user later
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ];
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return session.url;
}

export async function createBillingPortalSession(clerkId, returnUrl) {
  await connectToDatabase();
  const user = await User.findOne({ clerkId });
  if (!user || !user.stripeCustomerId) return null;

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}
