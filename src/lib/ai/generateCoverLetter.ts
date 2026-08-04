import Groq from "groq-sdk";
import { z } from "zod";

export const CoverLetterSchema = z.object({
  cover_letter_text: z.string(),
  key_highlights: z.array(z.string()),
});

export type CoverLetterResult = z.infer<typeof CoverLetterSchema>;

const SYSTEM_PROMPT = `You are a career strategist and executive resume writer. Write a compelling, professional cover letter tailored for a candidate applying for a specific job role. Return ONLY valid JSON, no preamble, no markdown code fences. Use this exact schema:

{
  "cover_letter_text": <string>,
  "key_highlights": [<string>, ...]
}`;

export async function generateCoverLetter(
  companyName: string,
  roleTitle: string,
  jobDescription?: string
): Promise<CoverLetterResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }

  const groq = new Groq({ apiKey });

  const prompt = `Write a tailored cover letter for candidate applying to:
Company: ${companyName}
Role: ${roleTitle}
${jobDescription ? `Job Description:\n${jobDescription}` : ""}`;

  let rawContent = "";
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_completion_tokens: 1200,
    });

    rawContent = response.choices[0]?.message?.content || "";
  } catch (apiErr: any) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_completion_tokens: 1200,
      });
      rawContent = response.choices[0]?.message?.content || "";
    } catch (fallbackErr) {
      throw apiErr;
    }
  }

  if (!rawContent) {
    throw new Error("Received empty response from Groq AI API.");
  }

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
    throw new Error(`Failed to parse Cover Letter JSON: ${jsonErr.message}`);
  }

  const validationResult = CoverLetterSchema.safeParse(parsed);
  if (!validationResult.success) {
    throw new Error("Cover Letter AI response failed Zod validation.");
  }

  return validationResult.data;
}
