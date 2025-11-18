"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Prevent static generation since this page requires client-side auth
export const dynamic = "force-dynamic";

export default function AuthPage() {
  const { supabase, user, isLoading: isAuthLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const isProcessing = loading || isAuthLoading;

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/dashboard");
    }
  }, [isAuthLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage(
          "Signup successful! Please check your email for confirmation."
        );
        setEmail("");
        setPassword("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo/Brand Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            FundThesis
          </h1>
          <p className="text-lg text-gray-600">
            {isSignup ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-lg p-10 md:p-12 border border-gray-200 shadow-sm">
          {/* Toggle between Login/Signup */}
          <div className="flex gap-3 mb-8">
            <button
              type="button"
              onClick={() => {
                setIsSignup(false);
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3 px-6 rounded text-base font-medium transition-all ${
                !isSignup
                  ? "bg-[#9DB38A] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignup(true);
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3 px-6 rounded text-base font-medium transition-all ${
                isSignup
                  ? "bg-[#9DB38A] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DB38A] focus:border-[#9DB38A] outline-none disabled:bg-gray-50"
                disabled={isProcessing}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DB38A] focus:border-[#9DB38A] outline-none disabled:bg-gray-50"
                disabled={isProcessing}
                required
                minLength={6}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-base text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-base text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full h-12 text-base bg-[#9DB38A] hover:bg-[#8BA378] text-white font-medium"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isSignup ? "Creating Account..." : "Signing In..."}
                </>
              ) : isSignup ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer Text */}
          <p className="mt-8 text-center text-base text-gray-500">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignup(false)}
                  className="text-[#9DB38A] hover:text-[#8BA378] font-medium"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignup(true)}
                  className="text-[#9DB38A] hover:text-[#8BA378] font-medium"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
