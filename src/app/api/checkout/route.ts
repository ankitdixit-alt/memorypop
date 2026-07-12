import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

// Initialize Stripe with secret key (server-side only)
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  return new Stripe(secretKey);
}
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();

    // Parse request body
    const body = await request.json();
    const { shareCode } = body;

    // Validate shareCode is provided
    if (!shareCode) {
      return NextResponse.json(
        { error: "Invalid shareCode" },
        { status: 400 }
      );
    }

    // Fetch MemoryPop from database
    const { data: memorypop, error: fetchError } = await supabase
      .from("memorypops")
      .select("*")
      .eq("share_code", shareCode)
      .single();

    if (fetchError || !memorypop) {
      return NextResponse.json(
        { error: "MemoryPop not found" },
        { status: 404 }
      );
    }

    // Check if already premium
    if (memorypop.is_premium) {
      return NextResponse.json(
        { error: "Already premium" },
        { status: 400 }
      );
    }

    // Get base URL from environment or headers
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("host")}`;

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "MemoryPop Plus - Founding Member",
              description: `Upgrade ${memorypop.recipient_name}'s ${memorypop.occasion} to MemoryPop Plus`,
            },
            unit_amount: 499, // €4.99 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/${shareCode}?upgraded=true`,
      cancel_url: `${baseUrl}/dashboard/${shareCode}`,
      metadata: {
        memorypopId: shareCode,
      },
    });

    // Return checkout URL to client
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Stripe error" },
      { status: 500 }
    );
  }
}
