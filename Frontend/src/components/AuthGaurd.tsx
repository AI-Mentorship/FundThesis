"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/AuthProvidor";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth"); // redirect if not authenticated
    }
  }, [loading, user, router]);

  if (loading || !user) return <div>Loading...</div>;

  return <>{children}</>;
}
