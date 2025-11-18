"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

// Prevent static generation since this page requires client-side auth
export const dynamic = 'force-dynamic';

export default function AuthPage() {
  const { supabase, user, isLoading: isAuthLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isProcessing = loading || isAuthLoading;

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/dashboard");
    }
  }, [isAuthLoading, user, router]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard"); // redirect after login
    }

    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else {
      alert("Signup successful! Please check your email for confirmation.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-4 border rounded">
      <h1 className="text-xl font-bold mb-4">Login / Signup</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
        disabled={isProcessing}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
        disabled={isProcessing}
      />

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleLogin}
          disabled={isProcessing}
          className="flex-1 p-2 bg-blue-500 text-white rounded"
        >
          {isProcessing ? "Loading..." : "Login"}
        </button>
        <button
          onClick={handleSignup}
          disabled={isProcessing}
          className="flex-1 p-2 bg-green-500 text-white rounded"
        >
          {isProcessing ? "Loading..." : "Signup"}
        </button>
      </div>
    </div>
  );
}
