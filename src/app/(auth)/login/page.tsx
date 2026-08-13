"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, ArrowRight, AlertCircle, Loader2, LogOut, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const supabase = createClient();

  useEffect(() => {
    async function checkExistingUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserEmail(user.email || null);
      }
      setCheckingAuth(false);
    }
    checkExistingUser();
  }, [supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message === "Failed to fetch") {
        setError("Unable to connect to authentication server. If this site is deployed live, make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your deployment provider (e.g. Vercel) environment variables.");
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    if (data.session) {
      // Force full window location refresh so session cookies sync across server components
      window.location.href = redirectTo;
    } else {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUserEmail(null);
    router.refresh();
  };

  if (checkingAuth) {
    return (
      <div className="py-8 text-center text-slate-500 flex items-center justify-center gap-2 font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Checking authentication...</span>
      </div>
    );
  }

  if (currentUserEmail) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-base text-emerald-900">Already Signed In</h3>
          <p className="text-xs text-emerald-700 font-medium">
            You are logged in as <span className="font-bold text-slate-900">{currentUserEmail}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={redirectTo}
            className="flex-1 py-3 px-4 gradient-bg text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleSignOut}
            className="py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Switch Account</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl gradient-bg text-white shadow-md shadow-indigo-500/20 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-500">
            Sign in to access your resume analyses and interview prep dashboard.
          </p>
        </div>

        <Suspense fallback={
          <div className="py-8 text-center text-slate-500 flex items-center justify-center gap-2 font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <span>Loading form...</span>
          </div>
        }>
          <LoginForm />
        </Suspense>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-sm text-slate-600 font-medium">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-indigo-600 font-bold hover:text-indigo-700 underline underline-offset-4"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
