"use client";

import { useState } from "react";
import { X, Sparkles, Send, Loader2, Award, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { InterviewEvaluation } from "@/lib/ai/evaluateInterviewAnswer";

interface InterviewPracticeModalProps {
  questionText: string;
  analysisId?: string;
  onClose: () => void;
}

export default function InterviewPracticeModal({
  questionText,
  analysisId,
  onClose,
}: InterviewPracticeModalProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || userAnswer.trim().length < 10) {
      setError("Please write a complete response before evaluating.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_id: analysisId,
          question_text: questionText,
          user_answer: userAnswer.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to evaluate answer.");
      }

      setEvaluation(data.evaluation);
    } catch (err: any) {
      setError(err.message || "An error occurred while evaluating your answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white max-w-2xl w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8 space-y-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Mock Interview Simulator</h3>
              <p className="text-xs text-slate-500 font-medium">Practice your response and receive instant AI feedback</p>
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
          {/* Question Display */}
          <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200 space-y-1">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">Target Question</span>
            <p className="text-sm font-bold text-slate-900 leading-relaxed">{questionText}</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!evaluation ? (
            /* Input Answer Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Response (STAR Method Recommended)
                </label>
                <textarea
                  rows={6}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Describe the Situation, Task, Action you took, and measurable Result achieved..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm font-medium transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !userAnswer.trim()}
                className="w-full py-3.5 px-5 gradient-bg text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Evaluating Response with AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit for AI Practice Scoring</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Evaluation Results */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Score Badges */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Overall Rating</span>
                  <span className="text-2xl font-black text-purple-600">{evaluation.star_rating} / 10</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">STAR Method</span>
                  <span className="text-2xl font-black text-indigo-600">{evaluation.star_method_score}%</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tech Accuracy</span>
                  <span className="text-2xl font-black text-emerald-600">{evaluation.technical_accuracy_score}%</span>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Strengths
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {evaluation.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Areas to Refine
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {evaluation.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sample Model Answer */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  Model High-Impact Answer
                </div>
                <p className="text-xs leading-relaxed text-slate-300 font-normal italic">
                  "{evaluation.sample_improved_answer}"
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEvaluation(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 gradient-bg text-white font-bold text-xs rounded-xl hover:opacity-95 transition-opacity"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
