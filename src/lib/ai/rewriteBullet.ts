import Groq from "groq-sdk";
import { z } from "zod";

export const BulletRewriteSchema = z.object({
  original_bullet: z.string(),
  quantified_impact_version: z.string(),
  action_verb_version: z.string(),
  ats_keyword_version: z.string(),
  key_improvements: z.array(z.string()),
});

export type BulletRewrite = z.infer<typeof BulletRewriteSchema>;

const SYSTEM_PROMPT = `You are a professional resume writer and executive recruiter. You will be given a single resume bullet point. Rewrite it into 3 optimized, high-impact variations and return ONLY valid JSON, no preamble, no markdown code fences. Use this exact schema:

{
  "original_bullet": <string>,
  "quantified_impact_version": <string>,
  "action_verb_version": <string>,
  "ats_keyword_version": <string>,
  "key_improvements": [<string>, ...]
}

- quantified_impact_version: Must add realistic metrics, key performance indicators (KPIs), percentage improvements, or scale.
- action_verb_version: Must start with strong, front-loaded executive/technical action verbs.
- ats_keyword_version: Must incorporate high-value industry tools and terminology.`;

export async function rewriteBullet(originalBullet: string): Promise<BulletRewrite> {
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
        { role: "user", content: `Rewrite this resume bullet point:\n"${originalBullet}"` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_completion_tokens: 1000,
    });

    rawContent = response.choices[0]?.message?.content || "";
  } catch (apiErr: any) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Rewrite this resume bullet point:\n"${originalBullet}"` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_completion_tokens: 1000,
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
    throw new Error(`Failed to parse AI bullet rewrite JSON: ${jsonErr.message}`);
  }

  const validationResult = BulletRewriteSchema.safeParse(parsed);
  if (!validationResult.success) {
    const errorDetails = JSON.stringify(validationResult.error.format());
    throw new Error(`AI Bullet Rewrite response failed Zod validation: ${errorDetails}`);
  }

  return validationResult.data;
}
