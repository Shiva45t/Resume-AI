import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateInterviewAnswer } from "@/lib/ai/evaluateInterviewAnswer";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { analysis_id, question_text, user_answer } = await req.json();

    if (!question_text || !user_answer) {
      return NextResponse.json(
        { error: "Missing question_text or user_answer" },
        { status: 400 }
      );
    }

    const evaluation = await evaluateInterviewAnswer(question_text, user_answer);

    // Store in DB if analysis_id provided
    if (analysis_id) {
      await supabase.from("interview_practice_sessions").insert({
        user_id: user.id,
        analysis_id,
        question_text,
        user_answer,
        star_rating: evaluation.star_rating,
        feedback_json: evaluation,
      });
    }

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (err: any) {
    console.error("Interview Evaluation API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to evaluate interview answer" },
      { status: 500 }
    );
  }
}
