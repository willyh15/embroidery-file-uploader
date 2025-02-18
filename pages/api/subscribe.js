import Stripe from "stripe";
import { getSession } from "next-auth/react";
import { kv } from "@vercel/kv";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const priceId = process.env.STRIPE_PRICE_ID;

  const sessionStripe = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription-success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription-cancel`,
  });

  await kv.set(`subscription:${session.user.email}`, { active: true });

  return res.status(200).json({ url: sessionStripe.url });
};