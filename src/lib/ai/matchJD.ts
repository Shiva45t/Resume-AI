import Groq from "groq-sdk";
import { JDMatch, JDMatchSchema } from "@/lib/types";

const SYSTEM_PROMPT = `You are an expert technical recruiter and interview coach. You will be given a candidate's resume text and a job description. Respond ONLY with valid JSON, no preamble, no markdown fences. Use this exact schema:

{
  "match_score": <integer 0-100>,
  "missing_keywords": [<string>, ...],
  "matching_strengths": [<string>, ...],
  "interview_questions": [<string>, ... 8 to 10 items]
}

interview_questions should be a realistic mix: some behavioral, some technical based on the JD's required skills, and 1-2 that probe gaps between the resume and JD. Base everything strictly on the provided resume and JD text.`;

export async function matchJD(rawResumeText: string, jdText: string): Promise<JDMatch> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }

  const groq = new Groq({ apiKey });

  const userPrompt = `CANDIDATE RESUME TEXT:\n${rawResumeText}\n\nJOB DESCRIPTION:\n${jdText}`;

  let rawContent = "";
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
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
          { role: "user", content: userPrompt },
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

  // Defensively strip markdown code fences
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

  const validationResult = JDMatchSchema.safeParse(parsed);
  if (!validationResult.success) {
    const errorDetails = JSON.stringify(validationResult.error.format());
    throw new Error(`AI JD Match response failed Zod schema validation: ${errorDetails}`);
  }

  return validationResult.data;
}
