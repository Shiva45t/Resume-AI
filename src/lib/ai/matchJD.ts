import Groq from "groq-sdk";
import { JDMatch, JDMatchSchema } from "@/lib/types";

export interface GitHubProjectContext {
  repo_name: string;
  repo_url: string;
  description?: string;
  readme_summary?: string;
  tech_stack: string[];
  stars: number;
}

const SYSTEM_PROMPT = `You are an expert technical recruiter and interview coach. You will be given a candidate's resume text, a job description, and optionally a list of the candidate's featured GitHub projects. Respond ONLY with valid JSON, no preamble, no markdown fences. Use this exact schema:

{
  "match_score": <integer 0-100>,
  "missing_keywords": [<string>, ...],
  "matching_strengths": [<string>, ...],
  "interview_questions": [<string>, ... 8 to 10 items],
  "recommended_projects": [
    {
      "repo_name": "<string, exact repository name>",
      "repo_url": "<string, repository URL>",
      "relevance_explanation": "<string, 1 sentence explaining why this GitHub project directly demonstrates key requirements in the JD>",
      "suggested_bullet_point": "<string, a high-impact STAR-format resume bullet point tailored to the JD's keywords describing this project>"
    }
  ]
}

If featured GitHub projects are provided in the user prompt, select 2 to 3 projects that best align with the Job Description requirements and populate recommended_projects. If no projects are provided or none fit, return an empty array [] for recommended_projects. Base everything strictly on the provided resume, JD text, and GitHub project context.`;

export async function matchJD(
  rawResumeText: string,
  jdText: string,
  githubProjects: GitHubProjectContext[] = []
): Promise<JDMatch> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }

  const groq = new Groq({ apiKey });

  let userPrompt = `CANDIDATE RESUME TEXT:\n${rawResumeText}\n\nJOB DESCRIPTION:\n${jdText}`;

  if (githubProjects && githubProjects.length > 0) {
    const formattedProjects = githubProjects
      .map(
        (p) =>
          `- Repo: ${p.repo_name} (${p.repo_url})\n  Stars: ${p.stars}\n  Tech Stack: ${
            p.tech_stack?.join(", ") || "General"
          }\n  Summary: ${p.readme_summary || p.description || "N/A"}`
      )
      .join("\n\n");
    userPrompt += `\n\nCANDIDATE FEATURED GITHUB PROJECTS:\n${formattedProjects}`;
  }

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
      max_completion_tokens: 1800,
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
        max_completion_tokens: 1800,
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
