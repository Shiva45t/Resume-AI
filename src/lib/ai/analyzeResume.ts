import Groq from "groq-sdk";
import { ResumeAnalysis, ResumeAnalysisSchema } from "@/lib/types";

const SYSTEM_PROMPT = `You are an expert resume reviewer, ATS specialist, and career coach. You will be given the raw extracted text of a resume. Analyze it thoroughly and respond ONLY with valid JSON, no preamble, no markdown code fences. Use this exact JSON schema:

{
  "overall_score": <integer 0-100>,
  "category_scores": {
    "content_score": <integer 0-100>,
    "ats_essentials_score": <integer 0-100>,
    "sections_score": <integer 0-100>,
    "hr_red_flags_score": <integer 0-100>,
    "seniority_score": <integer 0-100>
  },
  "contact_info": {
    "email": <string>,
    "phone": <string>,
    "linkedin": <string>,
    "location": <string>
  },
  "found_sections": [<string>, ... e.g. "Summary", "Experience", "Education", "Projects", "Skills"],
  "missing_sections": [<string>, ... e.g. "Certifications", "Summary"],
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "formatting_issues": [<string>, ...],
  "suggested_roles": [{"role": <string>, "reason": <string>}, ... 2 to 3 items],
  "ats_notes": <string>,
  "interview_questions": [<string>, ... 4 to 5 tailored behavioral & technical questions based on the resume skills]
}

Be specific and actionable. Base suggested_roles strictly on skills/experience actually present in the resume text. Extract contact info if found in raw text.`;

export async function analyzeResume(rawText: string): Promise<ResumeAnalysis> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }

  const groq = new Groq({ apiKey });

  let rawContent = "";
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here is the raw extracted text of the candidate's resume:\n\n${rawText}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_completion_tokens: 1500,
    });

    rawContent = response.choices[0]?.message?.content || "";
  } catch (apiErr: any) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Here is the raw extracted text of the candidate's resume:\n\n${rawText}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_completion_tokens: 1500,
      });
      rawContent = response.choices[0]?.message?.content || "";
    } catch (fallbackErr) {
      throw apiErr;
    }
  }

  if (!rawContent) {
    throw new Error("Received empty response from Groq AI API.");
  }

  // Defensively strip markdown code fences if present
  let cleanedJsonString = rawContent.trim();
  if (cleanedJsonString.startsWith("```")) {
    cleanedJsonString = cleanedJsonString
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanedJsonString);
  } catch (jsonErr: any) {
    throw new Error(`Failed to parse Groq AI JSON response: ${jsonErr.message}`);
  }

  const validationResult = ResumeAnalysisSchema.safeParse(parsed);
  if (!validationResult.success) {
    const errorDetails = JSON.stringify(validationResult.error.format());
    throw new Error(`AI response failed Zod schema validation: ${errorDetails}`);
  }

  return validationResult.data;
}
