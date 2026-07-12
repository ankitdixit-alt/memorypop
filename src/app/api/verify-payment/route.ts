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

    // Check if already premium (idempotent check)
    if (memorypop.is_premium) {
      return NextResponse.json({
        success: true,
        isPremium: true,
        message: "Already premium",
      });
    }

    // Retrieve recent checkout sessions and find one for this MemoryPop
    // Note: This is Phase 1A manual verification - Phase 1B will use webhooks
    const sessions = await stripe.checkout.sessions.list({
      limit: 20, // Increase limit to catch more sessions
    });

    // Find session matching this MemoryPop
    const session = sessions.data.find(
      (s) => s.metadata?.memorypopId === shareCode && s.payment_status === "paid"
    );

    if (!session) {
      return NextResponse.json(
        { error: "No payment found" },
        { status: 404 }
      );
    }

    // Verify payment was completed
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Update database with premium status
    const { error: updateError } = await supabase
      .from("memorypops")
      .update({
        is_premium: true,
        upgraded_at: new Date().toISOString(),
        stripe_payment_id: session.payment_intent as string,
        stripe_customer_id: session.customer as string,
      })
      .eq("share_code", shareCode);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Database update failed" },
        { status: 500 }
      );
    }

    // Success
    return NextResponse.json({
      success: true,
      isPremium: true,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
