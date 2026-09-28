import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { isCreatorAuthorizedForMemoryPop } from "@/lib/creatorSession";
import crypto from "crypto";

// Rate limiting: track invalid attempts per IP
const invalidAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_INVALID_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = invalidAttempts.get(ip);

  if (!attempt || now > attempt.resetAt) {
    return true; // Allow
  }

  return attempt.count < MAX_INVALID_ATTEMPTS;
}

function recordInvalidAttempt(ip: string): void {
  const now = Date.now();
  const attempt = invalidAttempts.get(ip);

  if (!attempt || now > attempt.resetAt) {
    invalidAttempts.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
  } else {
    attempt.count++;
  }
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: memorypopId } = await context.params;

  // Get client IP for rate limiting
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // Check rate limit
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: "Too many invalid attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    // Parse request body
    const { code } = await req.json();

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      recordInvalidAttempt(clientIp);
      return NextResponse.json(
        { error: "Beta code is required" },
        { status: 400 }
      );
    }

    // Verify creator authorization
    const authorized = await isCreatorAuthorizedForMemoryPop(memorypopId);

    if (!authorized) {
      recordInvalidAttempt(clientIp);
      return NextResponse.json(
        { error: "Unauthorized. Only the creator can upgrade this MemoryPop." },
        { status: 403 }
      );
    }

    // Fetch MemoryPop
    const { data: memorypop, error: fetchError } = await supabaseServer
      .from("memorypops")
      .select("id, is_premium, share_code")
      .eq("id", memorypopId)
      .single();

    if (fetchError || !memorypop) {
      return NextResponse.json(
        { error: "MemoryPop not found" },
        { status: 404 }
      );
    }

    // Check if already premium (idempotent - return success)
    if (memorypop.is_premium) {
      return NextResponse.json({
        success: true,
        message: "This MemoryPop is already upgraded to Plus",
        alreadyPremium: true,
      });
    }

    // Hash the submitted code
    const codeHash = hashCode(code.trim());

    // Find matching beta code
    const { data: betaCode, error: codeError } = await supabaseServer
      .from("beta_codes")
      .select("*")
      .eq("code_hash", codeHash)
      .eq("active", true)
      .single();

    // Distinguish database errors from invalid codes
    if (codeError) {
      // PGRST116 = no rows returned (genuinely invalid code)
      if (codeError.code === 'PGRST116') {
        recordInvalidAttempt(clientIp);
        return NextResponse.json(
          { error: "Invalid beta code" },
          { status: 400 }
        );
      }

      // Other errors are database/permission issues
      console.error("Beta code lookup error:", codeError);
      return NextResponse.json(
        { error: "Database error validating beta code. Please contact support." },
        { status: 500 }
      );
    }

    if (!betaCode) {
      recordInvalidAttempt(clientIp);
      return NextResponse.json(
        { error: "Invalid beta code" },
        { status: 400 }
      );
    }

    // Validate code constraints
    const now = new Date();

    if (new Date(betaCode.expires_at) < now) {
      recordInvalidAttempt(clientIp);
      return NextResponse.json(
        { error: "This beta code has expired" },
        { status: 400 }
      );
    }

    if (betaCode.current_redemptions >= betaCode.total_redemption_limit) {
      recordInvalidAttempt(clientIp);
      return NextResponse.json(
        { error: "This beta code has reached its redemption limit" },
        { status: 400 }
      );
    }

    // Atomic redemption: check if already redeemed (idempotent)
    const { data: existingRedemption } = await supabaseServer
      .from("beta_code_redemptions")
      .select("id")
      .eq("memorypop_id", memorypopId)
      .eq("beta_code_id", betaCode.id)
      .single();

    if (existingRedemption) {
      // Already redeemed - idempotent success
      return NextResponse.json({
        success: true,
        message: "Beta code already redeemed for this MemoryPop",
        alreadyRedeemed: true,
      });
    }

    // Perform atomic upgrade: increment redemptions + create redemption + upgrade memorypop
    const { error: incrementError } = await supabaseServer
      .from("beta_codes")
      .update({
        current_redemptions: betaCode.current_redemptions + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", betaCode.id)
      .eq("current_redemptions", betaCode.current_redemptions); // Optimistic lock

    if (incrementError) {
      // Race condition - another request incremented first
      return NextResponse.json(
        { error: "Redemption conflict. Please try again." },
        { status: 409 }
      );
    }

    // Record redemption
    const { error: redemptionError } = await supabaseServer
      .from("beta_code_redemptions")
      .insert({
        beta_code_id: betaCode.id,
        memorypop_id: memorypopId,
      });

    if (redemptionError) {
      // Rollback increment
      await supabaseServer
        .from("beta_codes")
        .update({
          current_redemptions: betaCode.current_redemptions,
        })
        .eq("id", betaCode.id);

      return NextResponse.json(
        { error: "Failed to record redemption" },
        { status: 500 }
      );
    }

    // Upgrade MemoryPop to Plus
    const { error: upgradeError } = await supabaseServer
      .from("memorypops")
      .update({
        is_premium: true,
        upgraded_at: new Date().toISOString(),
        upgrade_source: "beta_code",
      })
      .eq("id", memorypopId);

    if (upgradeError) {
      // Rollback redemption and increment
      await supabaseServer
        .from("beta_code_redemptions")
        .delete()
        .eq("memorypop_id", memorypopId)
        .eq("beta_code_id", betaCode.id);

      await supabaseServer
        .from("beta_codes")
        .update({
          current_redemptions: betaCode.current_redemptions,
        })
        .eq("id", betaCode.id);

      return NextResponse.json(
        { error: "Failed to upgrade MemoryPop" },
        { status: 500 }
      );
    }

    // Success - clear any rate limit for this IP
    invalidAttempts.delete(clientIp);

    return NextResponse.json({
      success: true,
      message: "Successfully upgraded to MemoryPop Plus!",
      shareCode: memorypop.share_code,
    });
  } catch (error) {
    console.error("Beta code redemption error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
