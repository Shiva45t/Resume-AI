import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { matchJD } from "@/lib/ai/matchJD";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { analysis_id, jd_text } = await req.json();

    if (!analysis_id || !jd_text) {
      return NextResponse.json(
        { error: "Missing required parameters: analysis_id and jd_text" },
        { status: 400 }
      );
    }

    // Verify ownership of analysis and fetch associated resume text
    const { data: analysisRecord, error: fetchError } = await supabase
      .from("analyses")
      .select("id, resume_id, resumes(raw_text)")
      .eq("id", analysis_id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !analysisRecord) {
      return NextResponse.json({ error: "Analysis record not found" }, { status: 404 });
    }

    const rawResumeText = (analysisRecord.resumes as any)?.raw_text || "";

    if (!rawResumeText) {
      return NextResponse.json(
        { error: "Resume text missing for analysis" },
        { status: 400 }
      );
    }

    // Fetch user's featured GitHub projects
    const { data: githubProjects } = await supabase
      .from("github_projects")
      .select("repo_name, repo_url, description, readme_summary, tech_stack, stars")
      .eq("user_id", user.id)
      .eq("is_featured", true);

    // Call Groq AI for JD Matching, Interview Prep, & GitHub Recommendations
    const matchData = await matchJD(rawResumeText, jd_text, githubProjects || []);

    // Save record to jd_matches table
    const { data: matchRecord, error: dbError } = await supabase
      .from("jd_matches")
      .insert({
        analysis_id,
        jd_text,
        match_score: matchData.match_score,
        missing_keywords: matchData.missing_keywords,
        matching_strengths: matchData.matching_strengths || [],
        interview_questions: matchData.interview_questions,
        recommended_projects: matchData.recommended_projects || [],
      })
      .select()
      .single();

    if (dbError || !matchRecord) {
      console.error("JD Match DB insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to store JD match in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jd_match_id: matchRecord.id,
      jd_match: matchRecord,
    });
  } catch (err: any) {
    console.error("Match JD API route error:", err);
    return NextResponse.json(
      { error: err.message || "JD matching failed" },
      { status: 500 }
    );
  }
}
