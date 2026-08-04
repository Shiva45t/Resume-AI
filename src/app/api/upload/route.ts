import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parsePdf } from "@/lib/parsing/parsePdf";
import { parseDocx } from "@/lib/parsing/parseDocx";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const jdText = (formData.get("jd_text") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds maximum limit of 5MB" },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    if (fileExtension !== "pdf" && fileExtension !== "docx") {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload a PDF or DOCX file." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let rawText = "";
    if (fileExtension === "pdf") {
      rawText = await parsePdf(buffer);
    } else {
      rawText = await parseDocx(buffer);
    }

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json(
        { error: "Extracted text is too short or unreadable. Please upload a valid resume." },
        { status: 400 }
      );
    }

    // Save extracted raw_text to resumes table
    const { data: resumeRecord, error: dbError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        file_name: fileName,
        raw_text: rawText,
      })
      .select()
      .single();

    if (dbError || !resumeRecord) {
      console.error("Database insert error:", dbError);
      if (dbError?.code === "PGRST205" || dbError?.message?.includes("schema cache") || dbError?.message?.includes("does not exist")) {
        return NextResponse.json(
          { error: "Database tables missing. Please run the SQL migration script (001_initial_schema.sql) in your Supabase SQL Editor." },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: dbError?.message || "Failed to save resume record to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resume_id: resumeRecord.id,
      file_name: fileName,
      raw_text: rawText,
      jd_text: jdText.trim(),
    });
  } catch (err: any) {
    console.error("Upload API route error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during upload" },
      { status: 500 }
    );
  }
}
