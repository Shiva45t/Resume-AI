import Groq from "groq-sdk";
import { z } from "zod";

export const InterviewEvaluationSchema = z.object({
  star_rating: z.number().int().min(1).max(10),
  technical_accuracy_score: z.number().int().min(0).max(100),
  star_method_score: z.number().int().min(0).max(100),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  sample_improved_answer: z.string(),
});

export type InterviewEvaluation = z.infer<typeof InterviewEvaluationSchema>;

const SYSTEM_PROMPT = `You are a senior technical interviewer and executive career coach. You will be given an interview question and a candidate's response. Evaluate the answer strictly and return ONLY valid JSON, no preamble, no markdown code fences. Use this exact JSON schema:

{
  "star_rating": <integer 1-10>,
  "technical_accuracy_score": <integer 0-100>,
  "star_method_score": <integer 0-100>,
  "strengths": [<string>, ...],
  "improvements": [<string>, ...],
  "sample_improved_answer": <string>
}

Provide specific, constructive feedback on technical clarity, communication, filler words, and the STAR framework (Situation, Task, Action, Result). Provide a polished, high-impact sample improved answer.`;

export async function evaluateInterviewAnswer(
  questionText: string,
  userAnswer: string
): Promise<InterviewEvaluation> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }

  const groq = new Groq({ apiKey });

  const userPrompt = `INTERVIEW QUESTION:\n${questionText}\n\nCANDIDATE'S RESPONSE:\n${userAnswer}`;

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
    throw new Error(`Failed to parse AI interview evaluation JSON: ${jsonErr.message}`);
  }

  const validationResult = InterviewEvaluationSchema.safeParse(parsed);
  if (!validationResult.success) {
    const errorDetails = JSON.stringify(validationResult.error.format());
    throw new Error(`AI Evaluation response failed Zod validation: ${errorDetails}`);
  }

  return validationResult.data;
}
