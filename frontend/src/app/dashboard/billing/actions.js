"use server";

import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongoose";

export async function createCheckoutSession(planType, isAnnual = false) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  await connectToDatabase();
  const user = await User.findOne({ clerkId });
  if (!user) throw new Error("User not found");

  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`;

  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      metadata: { clerkId },
    });
    stripeCustomerId = customer.id;
    user.stripeCustomerId = stripeCustomerId;
    await user.save();
  }

  // Create Checkout Session
  const sessionParams = {
    customer: stripeCustomerId,
    payment_method_types: ["card"],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: clerkId,
    metadata: {
      clerkId,
      planType,
      billingInterval: isAnnual ? "year" : "month",
    },
  };

  // Pricing: Pro = $49/mo or $39/mo billed annually ($468/yr)
  // Annual = 20% off → monthly_price * 12 * 0.8
  const interval = isAnnual ? "year" : "month";
  const PRO_MONTHLY_CENTS = 4900; // $49
  const PRO_ANNUAL_CENTS = Math.round(PRO_MONTHLY_CENTS * 12 * 0.8); // $470.40 → 47040¢

  if (planType === "pro") {
    const priceId = isAnnual
      ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID || null
      : process.env.STRIPE_PRO_PRICE_ID || null;

    if (priceId) {
      // Use pre-configured Stripe Price ID
      sessionParams.line_items = [{ price: priceId, quantity: 1 }];
    } else {
      // Dynamically build the price for testing
      sessionParams.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: { name: isAnnual ? "Pro Plan (Annual)" : "Pro Plan" },
            unit_amount: isAnnual ? PRO_ANNUAL_CENTS : PRO_MONTHLY_CENTS,
            recurring: { interval },
          },
          quantity: 1,
        },
      ];
    }
  } else if (planType === "custom") {
    sessionParams.line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Custom Plan",
          },
          unit_amount: 50000, // Fixed dynamic example, typically would accept an amount or use Stripe Payment Links
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ];
  } else {
    throw new Error("Invalid plan type");
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return { url: session.url };
}

export async function createBillingPortalSession() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");
  await connectToDatabase();
  const user = await User.findOne({ clerkId });
  if (!user || !user.stripeCustomerId) return { url: null };
  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });
  return { url: session.url };
}

export async function getBillingInfo() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  await connectToDatabase();
  const user = await User.findOne({ clerkId }).lean();
  if (!user) return null;

  return {
    plan: user.plan || "free",
    usage: {
      apiCalls: user.usage?.apiCalls || 0,
      transactionsScanned: user.usage?.transactionsScanned || 0,
    },
    paymentHistory: Array.isArray(user.paymentHistory)
      ? JSON.parse(JSON.stringify(user.paymentHistory))
      : [],
    stripeCustomerId: user.stripeCustomerId || null,
  };
}

export async function verifyCheckoutSession(sessionId) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return false;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.metadata?.clerkId !== clerkId) return false;

    if (session.payment_status === "paid") {
      await connectToDatabase();
      const user = await User.findOne({ clerkId });
      if (user) {
        // Prevent duplicate updates if session was already handled locally or by webhook
        const alreadyHandled = user.paymentHistory?.some(
          (p) => p.invoiceId === session.invoice || p.invoiceId === session.id,
        );

        if (!alreadyHandled) {
          user.stripeCustomerId = session.customer;
          user.stripeSubscriptionId = session.subscription;
          user.plan = session.metadata?.planType || "custom";

          user.paymentHistory.push({
            amount: session.amount_total / 100,
            currency: session.currency,
            status: session.payment_status,
            invoiceId: session.invoice || session.id, // Use session id if invoice not present immediately
            date: new Date(),
          });

          await user.save();
          return true;
        }
      }
    }
  } catch (err) {
    console.error("Session verification error:", err);
  }
  return false;
}
