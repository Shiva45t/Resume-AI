import ResumeUploadForm from "@/components/ResumeUploadForm";
import { Sparkles } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          AI-Powered Resume Analysis
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Upload Your Resume
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
          Get instantaneous feedback, ATS compatibility notes, role matches, and custom interview prep questions in seconds.
        </p>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-slate-200 shadow-xl">
        <ResumeUploadForm />
      </div>
    </div>
  );
}
