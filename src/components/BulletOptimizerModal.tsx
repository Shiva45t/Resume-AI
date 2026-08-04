"use client";

import { useState } from "react";
import { X, Sparkles, Copy, Check, Zap, Target, Award, Loader2 } from "lucide-react";
import { BulletRewrite } from "@/lib/ai/rewriteBullet";

interface BulletOptimizerModalProps {
  initialBullet?: string;
  onClose: () => void;
}

export default function BulletOptimizerModal({
  initialBullet = "",
  onClose,
}: BulletOptimizerModalProps) {
  const [bulletText, setBulletText] = useState(initialBullet);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulletRewrite | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleRewrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletText.trim() || bulletText.trim().length < 5) {
      setError("Please enter a valid bullet point to rewrite.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/rewrite-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: bulletText.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to rewrite bullet point.");
      }

      setResult(data.rewrite);
    } catch (err: any) {
      setError(err.message || "An error occurred while rewriting your bullet point.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white max-w-2xl w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8 space-y-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">1-Click AI Bullet Optimizer</h3>
              <p className="text-xs text-slate-500 font-medium">Turn weak bullets into quantified, action-driven accomplishments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleRewrite} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Original Bullet Point
              </label>
              <textarea
                rows={3}
                value={bulletText}
                onChange={(e) => setBulletText(e.target.value)}
                placeholder="e.g. Responsible for managing PLC systems and working on team projects..."
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-medium transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !bulletText.trim()}
              className="w-full py-3.5 px-5 gradient-bg text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating 3 Optimized Versions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Optimize Bullet Point with AI</span>
                </>
              )}
            </button>
          </form>

          {/* Results Display */}
          {result && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-300">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Optimized Bullet Variations
              </h4>

              {/* Version 1: Quantified Impact */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    Quantified Impact Version
                  </span>
                  <button
                    onClick={() => handleCopy(result.quantified_impact_version, "quantified")}
                    className="p-1.5 rounded-lg bg-white border border-emerald-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
                    title="Copy bullet"
                  >
                    {copiedKey === "quantified" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-900 font-bold leading-relaxed pr-8">
                  {result.quantified_impact_version}
                </p>
              </div>

              {/* Version 2: Strong Action Verbs */}
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-800 uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    Front-Loaded Action Verb Version
                  </span>
                  <button
                    onClick={() => handleCopy(result.action_verb_version, "action")}
                    className="p-1.5 rounded-lg bg-white border border-indigo-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
                    title="Copy bullet"
                  >
                    {copiedKey === "action" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-900 font-bold leading-relaxed pr-8">
                  {result.action_verb_version}
                </p>
              </div>

              {/* Version 3: ATS Keyword Dense */}
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-800 uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    ATS Keyword-Dense Version
                  </span>
                  <button
                    onClick={() => handleCopy(result.ats_keyword_version, "ats")}
                    className="p-1.5 rounded-lg bg-white border border-purple-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
                    title="Copy bullet"
                  >
                    {copiedKey === "ats" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-900 font-bold leading-relaxed pr-8">
                  {result.ats_keyword_version}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
