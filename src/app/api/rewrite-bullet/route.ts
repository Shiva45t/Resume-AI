import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rewriteBullet } from "@/lib/ai/rewriteBullet";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bullet } = await req.json();

    if (!bullet || typeof bullet !== "string" || bullet.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a valid bullet point to rewrite." },
        { status: 400 }
      );
    }

    const rewrite = await rewriteBullet(bullet.trim());

    return NextResponse.json({
      success: true,
      rewrite,
    });
  } catch (err: any) {
    console.error("Rewrite Bullet API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to rewrite bullet point" },
      { status: 500 }
    );
  }
}
