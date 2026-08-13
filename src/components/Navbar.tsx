"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, FileText, LayoutDashboard, LogOut, LogIn, UserPlus, ChevronDown, Briefcase, BarChart3, CheckCircle2, FolderGit2 } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
      setLoading(false);
    }
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl gradient-bg text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Resume<span className="gradient-text">IQ</span>
          </span>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {!loading && (
            <>
              {userEmail ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      pathname === "/dashboard"
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <Link
                    href="/jobs"
                    className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      pathname === "/jobs"
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Job Finder
                  </Link>

                  <Link
                    href="/analytics"
                    className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      pathname === "/analytics"
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Link>

                  <Link
                    href="/upload"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md ${
                      pathname === "/upload"
                        ? "bg-indigo-700 text-white shadow-indigo-600/30"
                        : "gradient-bg text-white shadow-indigo-500/20 hover:opacity-95"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Analyze Resume
                  </Link>

                  <div className="h-5 w-[1px] bg-slate-200 my-auto hidden sm:block" />

                  {/* User Settings Avatar Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label="User Settings"
                    >
                      <div className="w-8 h-8 rounded-full gradient-bg text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {userInitial}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Floating Dropdown Card */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* User Header Info */}
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                          <div className="w-10 h-10 rounded-2xl gradient-bg text-white font-black text-base flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                            {userInitial}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-slate-900">Account Settings</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <p className="text-xs text-slate-500 font-medium truncate mt-0.5" title={userEmail}>
                              {userEmail}
                            </p>
                          </div>
                        </div>

                        {/* Dropdown Options */}
                        <div className="p-1.5 space-y-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                            Dashboard
                          </Link>

                          <Link
                            href="/jobs"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          >
                            <Briefcase className="w-4 h-4 text-emerald-600" />
                            AI Job Finder
                          </Link>

                          <Link
                            href="/analytics"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          >
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            Analytics & Trends
                          </Link>

                          <Link
                            href="/upload"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-purple-600" />
                            New Resume Upload
                          </Link>

                          <Link
                            href="/settings"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          >
                            <FolderGit2 className="w-4 h-4 text-slate-900" />
                            GitHub Integration
                          </Link>

                          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between border-t border-slate-100 mt-1 pt-2">
                            <span>Status</span>
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Active</span>
                          </div>
                        </div>

                        {/* Sign Out Button */}
                        <div className="border-t border-slate-100 p-1.5 mt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 text-red-600" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white gradient-bg rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
