import Groq from "groq-sdk";
import { z } from "zod";

export const JobListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  type: z.enum(["Remote", "On-site", "Hybrid"]),
  salary: z.string(),
  match_score: z.number().int().min(0).max(100),
  description: z.string(),
  required_skills: z.array(z.string()),
  posted_date: z.string(),
});

export const JobSearchResultsSchema = z.object({
  jobs: z.array(JobListingSchema),
});

export type JobListing = z.infer<typeof JobListingSchema>;

const SYSTEM_PROMPT = `You are a tech talent recruiter and career placement platform AI. Based on a candidate's resume skills or search query, generate 6 realistic, high-quality open job listings. Return ONLY valid JSON matching this schema:

{
  "jobs": [
    {
      "id": <string unique id>,
      "title": <string role title>,
      "company": <string company name>,
      "location": <string city/country or Remote>,
      "type": "Remote" | "On-site" | "Hybrid",
      "salary": <string e.g. "$80,000 - $110,000 / yr">,
      "match_score": <integer 65-98 based on skill alignment>,
      "description": <string brief 2-sentence role overview>,
      "required_skills": [<string>, ...],
      "posted_date": <string e.g. "2 days ago">
    }
  ]
}`;

export async function findJobs(query?: string, userResumeSkills?: string[]): Promise<JobListing[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }

  const groq = new Groq({ apiKey });

  const promptText = `Generate job opportunities aligned with candidate profile:
${userResumeSkills ? `Skills: ${userResumeSkills.join(", ")}` : ""}
${query ? `Search Query: ${query}` : ""}`;

  let rawContent = "";
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: promptText },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_completion_tokens: 1500,
    });

    rawContent = response.choices[0]?.message?.content || "";
  } catch (apiErr: any) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: promptText },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
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
    throw new Error(`Failed to parse AI Job Finder JSON: ${jsonErr.message}`);
  }

  const validationResult = JobSearchResultsSchema.safeParse(parsed);
  if (!validationResult.success) {
    throw new Error("AI Job Finder response failed Zod schema validation.");
  }

  return validationResult.data.jobs;
}
