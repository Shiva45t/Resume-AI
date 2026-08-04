import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findJobs } from "@/lib/ai/findJobs";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let { query } = await req.json();

    let userSkills: string[] = [];

    if (user) {
      // Get candidate's latest analysis strengths & suggested roles
      const { data: latestAnalysis } = await supabase
        .from("analyses")
        .select("strengths, suggested_roles")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (latestAnalysis) {
        if (latestAnalysis.strengths) userSkills.push(...latestAnalysis.strengths);
        if (latestAnalysis.suggested_roles) {
          userSkills.push(...latestAnalysis.suggested_roles.map((r: any) => r.role));
        }
      }
    }

    const jobs = await findJobs(query || "", userSkills);

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (err: any) {
    console.error("Job Search API route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to search jobs" },
      { status: 500 }
    );
  }
}
