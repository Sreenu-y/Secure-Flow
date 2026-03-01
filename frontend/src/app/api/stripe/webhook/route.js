import { stripe } from "@/lib/stripe";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // Retrieve the clerkId from metadata
        const clerkId = session.metadata?.clerkId;
        const planType = session.metadata?.planType; // "pro" or "custom"

        if (clerkId) {
          const user = await User.findOne({ clerkId });
          if (user) {
            user.stripeCustomerId = session.customer;
            user.stripeSubscriptionId = session.subscription;
            user.plan = planType || "custom";

            // Log payment
            user.paymentHistory.push({
              amount: session.amount_total / 100, // Amount is in cents
              currency: session.currency,
              status: session.payment_status,
              invoiceId: session.invoice,
              date: new Date(),
            });

            await user.save();
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const user = await User.findOne({
          stripeSubscriptionId: subscription.id,
        });

        if (user) {
          user.plan = "free";
          await user.save();
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        // Optionally update expiry dates or append to payment history
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
