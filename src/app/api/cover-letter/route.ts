import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCoverLetter } from "@/lib/ai/generateCoverLetter";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { company_name, role_title, job_description } = await req.json();

    if (!company_name || !role_title) {
      return NextResponse.json({ error: "Missing company_name or role_title" }, { status: 400 });
    }

    const coverLetter = await generateCoverLetter(company_name, role_title, job_description);

    return NextResponse.json({
      success: true,
      cover_letter: coverLetter,
    });
  } catch (err: any) {
    console.error("Cover Letter API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
