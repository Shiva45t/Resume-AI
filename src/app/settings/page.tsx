"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GitHubProjectRecord } from "@/lib/types";
import {
  FolderGit2,
  RefreshCw,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [projects, setProjects] = useState<GitHubProjectRecord[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadProfileAndProjects() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingUser(false);
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("github_username")
        .eq("id", user.id)
        .single();

      if (profile?.github_username) {
        setUsername(profile.github_username);
      }

      // Fetch existing synced projects
      const { data: projData } = await supabase
        .from("github_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("stars", { ascending: false });

      if (projData) {
        setProjects(projData as GitHubProjectRecord[]);
      }

      setLoadingUser(false);
    }

    loadProfileAndProjects();
  }, [supabase]);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setError("Please enter a valid GitHub username.");
      return;
    }

    setSyncing(true);

    try {
      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_username: username.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "GitHub sync failed.");
      }

      setProjects(data.projects || []);
      setSuccessMsg(
        `Successfully synced ${data.count} project${data.count === 1 ? "" : "s"} from GitHub with Groq AI summaries!`
      );
    } catch (err: any) {
      console.error("Sync error:", err);
      setError(err.message || "Failed to sync GitHub repositories.");
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleFeatured = async (projectId: string, currentFeatured: boolean) => {
    const nextVal = !currentFeatured;

    // Optimistic UI state update
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, is_featured: nextVal } : p))
    );

    const { error: updateErr } = await supabase
      .from("github_projects")
      .update({ is_featured: nextVal })
      .eq("id", projectId);

    if (updateErr) {
      console.error("Failed to update project status:", updateErr);
      // Rollback optimistic state
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, is_featured: currentFeatured } : p))
      );
    }
  };

  if (loadingUser) {
    return (
      <div className="py-16 text-center text-slate-500 flex items-center justify-center gap-2 font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading settings...</span>
      </div>
    );
  }

  const featuredCount = projects.filter((p) => p.is_featured).length;

  return (
    <div className="space-y-8 py-2 w-full">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Top Banner Hero Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Portfolio Integration</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Profile & <span className="gradient-text">GitHub Integration</span>
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl font-normal leading-relaxed">
            Connect your public GitHub repositories so Groq AI can match your real-world projects against target Job Descriptions and generate customized resume bullet points.
          </p>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center gap-3 bg-indigo-50/80 border border-indigo-200 p-4 rounded-2xl shrink-0">
            <div className="p-2.5 rounded-xl gradient-bg text-white shadow-md shadow-indigo-500/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 block">
                Featured Status
              </span>
              <p className="text-sm font-black text-slate-900">
                {featuredCount} / {projects.length} Repos Active
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 font-medium shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 font-medium shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sync Control Card */}
      <div className="glass-card p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-md">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Public GitHub Account</h2>
              <p className="text-xs text-slate-500 font-medium">
                No secret tokens required. Syncs public repos, README files, and tech stack tags.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSync} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-3.5 text-slate-400 font-extrabold text-sm">@</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="github-username"
              className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={syncing || !username.trim()}
            className="py-3.5 px-8 gradient-bg text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Syncing & Summarizing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Sync Projects</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Synced Repositories Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <span>Synced Repositories ({projects.length})</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            Toggle switch ON to enable AI recommendation for target job descriptions.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-3xl border border-dashed border-slate-300 space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 inline-block">
              <FolderGit2 className="w-10 h-10 mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Projects Synced Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              Enter your public GitHub handle above and click <strong>"Sync Projects"</strong> to import your top repositories with AI-generated summaries.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className={`glass-card glass-card-hover p-6 rounded-3xl border space-y-4 flex flex-col justify-between ${
                  proj.is_featured
                    ? "border-indigo-200/90 shadow-md shadow-indigo-500/5"
                    : "opacity-75 bg-slate-50/50 border-slate-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <a
                        href={proj.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-900 hover:text-indigo-600 text-base flex items-center gap-1.5 transition-colors truncate"
                      >
                        <span className="truncate">{proj.repo_name}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </a>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {proj.stars} stars
                        </span>
                      </div>
                    </div>

                    {/* Feature Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-0.5">
                      <input
                        type="checkbox"
                        checked={proj.is_featured}
                        onChange={() => handleToggleFeatured(proj.id, proj.is_featured)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* AI Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
                    {proj.readme_summary || proj.description || "No summary available."}
                  </p>
                </div>

                {/* Tech Stack Badges */}
                {proj.tech_stack && proj.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                    {proj.tech_stack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs font-bold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
