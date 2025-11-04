"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// Prevent static generation since this page requires client-side auth
export const dynamic = 'force-dynamic';

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) setError(error.message);
    else router.push("/dashboard"); // redirect after login
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) setError(error.message);
    else alert("Signup successful! Please check your email for confirmation.");
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
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex-1 p-2 bg-blue-500 text-white rounded"
        >
          {loading ? "Loading..." : "Login"}
        </button>
        <button
          onClick={handleSignup}
          disabled={loading}
          className="flex-1 p-2 bg-green-500 text-white rounded"
        >
          {loading ? "Loading..." : "Signup"}
        </button>
      </div>
    </div>
  );
}
