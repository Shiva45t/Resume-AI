"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, AlertCircle, Loader2, Sparkles, Target } from "lucide-react";

export default function ResumeUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusStep, setStatusStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (extension !== "pdf" && extension !== "docx") {
      setError("Please select a PDF or DOCX file.");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a resume file to upload.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Step 1: Upload & Extract Raw Text
      setStatusStep("Extracting text from resume (PDF/DOCX)...");
      const formData = new FormData();
      formData.append("file", file);
      if (jdText.trim()) {
        formData.append("jd_text", jdText.trim());
      }

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || "Failed to upload and parse resume.");
      }

      // Step 2: Call AI Resume Analysis
      setStatusStep("Analyzing resume strengths & ATS optimization with Groq AI...");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_id: uploadData.resume_id }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok || !analyzeData.success) {
        throw new Error(analyzeData.error || "Failed to analyze resume with Groq AI.");
      }

      const analysisId = analyzeData.analysis_id;

      // Step 3: Call JD Match if JD provided
      if (jdText.trim()) {
        setStatusStep("Matching resume against Job Description & generating interview prep...");
        const matchRes = await fetch("/api/match-jd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis_id: analysisId,
            jd_text: jdText.trim(),
          }),
        });

        const matchData = await matchRes.json();
        if (!matchRes.ok || !matchData.success) {
          console.warn("JD match step failed, but analysis completed:", matchData.error);
        }
      }

      // Done -> Redirect to Analysis page
      setStatusStep("Finalizing dashboard view...");
      router.push(`/analysis/${analysisId}`);
      router.refresh();
    } catch (err: any) {
      console.error("Upload workflow error:", err);
      setError(err.message || "An error occurred while processing your request.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* File Dropzone Section */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          Upload Resume <span className="text-red-500">*</span>
        </label>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
            dragActive
              ? "border-indigo-600 bg-indigo-50/80 scale-[1.01]"
              : file
              ? "border-emerald-500/60 bg-emerald-50/50"
              : "border-slate-300 hover:border-indigo-400 bg-slate-50/50"
          }`}
        >
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          {file ? (
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!loading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="inline-flex p-4 rounded-2xl bg-indigo-50 text-indigo-600 mb-1 shadow-xs">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-slate-800">
                Drag and drop your resume here, or <span className="text-indigo-600 underline">browse</span>
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Supports PDF and DOCX files up to 5MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Optional Job Description Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-600" />
            Target Job Description <span className="text-xs font-normal text-slate-500">(Optional)</span>
          </label>
        </div>
        <textarea
          rows={5}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          disabled={loading}
          placeholder="Paste the job description here to compare skill match scores, missing keywords, and generate targeted interview questions..."
          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-y text-sm font-medium disabled:opacity-50"
        />
      </div>

      {/* Loading Progress Feedback */}
      {loading && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center gap-3 font-medium shadow-xs">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600 shrink-0" />
          <span className="text-sm">{statusStep}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !file}
        className="w-full py-4 px-6 gradient-bg text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Analyze Resume & Prep Interview</span>
          </>
        )}
      </button>
    </form>
  );
}
