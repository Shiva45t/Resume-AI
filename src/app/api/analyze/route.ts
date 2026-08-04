import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeResume } from "@/lib/ai/analyzeResume";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resume_id } = await req.json();

    if (!resume_id) {
      return NextResponse.json({ error: "Missing resume_id" }, { status: 400 });
    }

    // Fetch resume raw_text
    const { data: resumeRecord, error: fetchError } = await supabase
      .from("resumes")
      .select("raw_text")
      .eq("id", resume_id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !resumeRecord) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Call Groq AI analysis
    const analysisData = await analyzeResume(resumeRecord.raw_text);

    // Persist analysis result into DB
    const insertPayload: any = {
      resume_id,
      user_id: user.id,
      overall_score: analysisData.overall_score,
      strengths: analysisData.strengths,
      weaknesses: analysisData.weaknesses,
      formatting_issues: analysisData.formatting_issues,
      suggested_roles: analysisData.suggested_roles,
      ats_notes: analysisData.ats_notes || "",
    };

    // Include extra dynamic columns if present
    if (analysisData.category_scores) insertPayload.category_scores = analysisData.category_scores;
    if (analysisData.contact_info) insertPayload.contact_info = analysisData.contact_info;
    if (analysisData.found_sections) insertPayload.found_sections = analysisData.found_sections;
    if (analysisData.missing_sections) insertPayload.missing_sections = analysisData.missing_sections;
    if (analysisData.interview_questions) insertPayload.interview_questions = analysisData.interview_questions;

    const { data: analysisRecord, error: dbError } = await supabase
      .from("analyses")
      .insert(insertPayload)
      .select()
      .single();

    if (dbError || !analysisRecord) {
      console.error("Analysis DB insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to store analysis in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis_id: analysisRecord.id,
      analysis: analysisRecord,
    });
  } catch (err: any) {
    console.error("Analyze API route error:", err);
    return NextResponse.json(
      { error: err.message || "Resume analysis failed" },
      { status: 500 }
    );
  }
}
