import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    let github_username = body.github_username?.trim();

    // If username not in body, check existing profile
    if (!github_username) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("github_username")
        .eq("id", user.id)
        .single();
      github_username = profile?.github_username?.trim();
    }

    if (!github_username) {
      return NextResponse.json(
        { error: "Please enter your GitHub username before syncing." },
        { status: 400 }
      );
    }

    // Save/update profile with username
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        github_username,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    // Call GitHub REST API for repos
    const headers = {
      "User-Agent": "ResumeIQ-App",
      Accept: "application/vnd.github.v3+json",
    };

    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(github_username)}/repos?sort=updated&per_page=20`,
      { headers }
    );

    if (reposRes.status === 404) {
      return NextResponse.json(
        { error: `GitHub user "${github_username}" was not found. Please check the spelling.` },
        { status: 404 }
      );
    }

    if (reposRes.status === 403) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded. Please wait a few minutes before trying again." },
        { status: 403 }
      );
    }

    if (!reposRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch GitHub repositories (HTTP ${reposRes.status}).` },
        { status: 500 }
      );
    }

    const repos = await reposRes.json();
    if (!Array.isArray(repos)) {
      return NextResponse.json(
        { error: "Invalid repository response format from GitHub." },
        { status: 500 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    const groq = apiKey ? new Groq({ apiKey }) : null;

    const projectsToUpsert = [];

    // Process top public repositories
    for (const repo of repos) {
      if (repo.fork) continue; // Focus on original projects

      const repoName = repo.name;
      const repoUrl = repo.html_url || `https://github.com/${github_username}/${repoName}`;
      const description = repo.description || "";
      const stars = repo.stargazers_count || 0;

      // 1. Fetch language list
      let languages: string[] = [];
      try {
        const langRes = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(github_username)}/${encodeURIComponent(repoName)}/languages`,
          { headers }
        );
        if (langRes.ok) {
          const langData = await langRes.json();
          languages = Object.keys(langData);
        }
      } catch (err) {
        console.warn(`Failed to fetch languages for ${repoName}:`, err);
      }

      // 2. Fetch README
      let readmeText = "";
      try {
        const readmeRes = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(github_username)}/${encodeURIComponent(repoName)}/readme`,
          { headers }
        );
        if (readmeRes.ok) {
          const readmeData = await readmeRes.json();
          if (readmeData.content) {
            const decoded = Buffer.from(readmeData.content, "base64").toString("utf-8");
            readmeText = decoded.slice(0, 3000); // Slice to ~3000 chars
          }
        }
      } catch (err) {
        console.warn(`No README for ${repoName}:`, err);
      }

      // 3. Summarize with Groq AI if available & README/description present
      let readmeSummary = description || "GitHub repository project.";
      let techStack = languages.length > 0 ? languages : ["Software Project"];

      if (groq && (readmeText || description)) {
        try {
          const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You are a technical recruiter and developer. Given a GitHub repository's name, description, languages, and README text, summarize what the project accomplishes and list key technologies used. Respond ONLY with valid JSON, no markdown fences:\n{\n  \"readme_summary\": \"2-3 sentence plain-English summary of what the project does and key features.\",\n  \"tech_stack\": [\"Tech1\", \"Tech2\", ...]\n}",
              },
              {
                role: "user",
                content: `Repo Name: ${repoName}\nDescription: ${description}\nLanguages: ${languages.join(", ")}\nREADME Snippet:\n${readmeText}`,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
            max_completion_tokens: 400,
          });

          const rawJson = completion.choices[0]?.message?.content?.trim() || "";
          let cleaned = rawJson;
          if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
          }
          const parsed = JSON.parse(cleaned);
          if (parsed.readme_summary) {
            readmeSummary = parsed.readme_summary;
          }
          if (Array.isArray(parsed.tech_stack) && parsed.tech_stack.length > 0) {
            techStack = parsed.tech_stack;
          }
        } catch (groqErr) {
          console.warn(`Groq summary fallback for ${repoName}:`, groqErr);
        }
      }

      projectsToUpsert.push({
        user_id: user.id,
        repo_name: repoName,
        repo_url: repoUrl,
        description,
        readme_summary: readmeSummary,
        tech_stack: techStack,
        stars,
        is_featured: true,
        last_synced_at: new Date().toISOString(),
      });
    }

    if (projectsToUpsert.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No non-fork public repositories found for this GitHub account.",
        projects: [],
      });
    }

    // Upsert into database
    const { data: upserted, error: dbError } = await supabase
      .from("github_projects")
      .upsert(projectsToUpsert, { onConflict: "user_id,repo_name" })
      .select();

    if (dbError) {
      console.error("Database upsert error for github_projects:", dbError);
      return NextResponse.json(
        { error: "Failed to store synced projects in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: upserted?.length || 0,
      projects: upserted || [],
    });
  } catch (err: any) {
    console.error("GitHub Sync route error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during GitHub sync." },
      { status: 500 }
    );
  }
}
