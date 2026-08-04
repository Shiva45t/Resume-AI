"use client";

import { useState } from "react";
import { Briefcase, Plus, Check, Loader2 } from "lucide-react";

interface RoleItem {
  role: string;
  reason: string;
}

interface RoleSuggestionCardProps {
  roles: RoleItem[];
}

export default function RoleSuggestionCard({ roles }: RoleSuggestionCardProps) {
  const [savedRoles, setSavedRoles] = useState<Record<string, boolean>>({});
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  if (!roles || roles.length === 0) return null;

  const handleSaveToTracker = async (roleTitle: string) => {
    setLoadingRole(roleTitle);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: "Target Company",
          role_title: roleTitle,
          status: "wishlist",
          match_score: 85,
        }),
      });

      if (res.ok) {
        setSavedRoles((prev) => ({ ...prev, [roleTitle]: true }));
      }
    } catch (err) {
      console.error("Failed to save to tracker:", err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600">
          <Briefcase className="w-5 h-5" />
          <h3 className="text-lg font-bold text-slate-900">Suggested Job Roles</h3>
        </div>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          1-Click Save to Tracker
        </span>
      </div>
      <p className="text-xs text-slate-500 font-medium">
        Based strictly on your verified skills and professional experience extracted from your resume:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {roles.map((item, idx) => {
          const isSaved = savedRoles[item.role];
          const isLoading = loadingRole === item.role;

          return (
            <div
              key={idx}
              className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div>
                <span className="font-bold text-slate-900 text-base block mb-1">{item.role}</span>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.reason}</p>
              </div>

              <button
                onClick={() => !isSaved && handleSaveToTracker(item.role)}
                disabled={isSaved || isLoading}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isSaved
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 shadow-xs"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved to Job Tracker</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Save to Job Tracker</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
