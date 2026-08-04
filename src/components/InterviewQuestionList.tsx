"use client";

import { useState } from "react";
import { HelpCircle, Check, Copy, Sparkles, MessageSquarePlus } from "lucide-react";
import InterviewPracticeModal from "@/components/InterviewPracticeModal";

interface InterviewQuestionListProps {
  questions: string[];
  analysisId?: string;
}

export default function InterviewQuestionList({ questions, analysisId }: InterviewQuestionListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activePracticeQuestion, setActivePracticeQuestion] = useState<string | null>(null);

  if (!questions || questions.length === 0) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-700">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-slate-900">Tailored Interview Questions</h3>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-700 font-bold">
          {questions.length} Questions
        </span>
      </div>
      <p className="text-xs text-slate-500 font-medium">
        Realistic interview questions tailored specifically to your resume and target job description (behavioral, technical, and skill-gap probes):
      </p>

      <div className="space-y-3 pt-1">
        {questions.map((question, idx) => (
          <div
            key={idx}
            className="group relative bg-slate-50/80 p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-600 shrink-0 mt-0.5">
                <HelpCircle className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">
                  Question {idx + 1}
                </span>
                <p className="text-sm text-slate-800 leading-relaxed font-semibold">
                  {question}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => setActivePracticeQuestion(question)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-colors"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                Practice Answer
              </button>

              <button
                onClick={() => handleCopy(question, idx)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
                title="Copy question"
              >
                {copiedIndex === idx ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {activePracticeQuestion && (
        <InterviewPracticeModal
          questionText={activePracticeQuestion}
          analysisId={analysisId}
          onClose={() => setActivePracticeQuestion(null)}
        />
      )}
    </div>
  );
}
