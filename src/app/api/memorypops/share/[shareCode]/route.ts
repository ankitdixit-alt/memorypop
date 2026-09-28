import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ shareCode: string }> }
) {
  const { shareCode } = await context.params;

  try {
    const { data: memorypop, error } = await supabaseServer
      .from("memorypops")
      .select("id, is_premium, share_code")
      .eq("share_code", shareCode)
      .single();

    if (error || !memorypop) {
      return NextResponse.json(
        { error: "MemoryPop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: memorypop.id,
      is_premium: memorypop.is_premium,
      share_code: memorypop.share_code,
    });
  } catch (error) {
    console.error("Error fetching MemoryPop by share code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
