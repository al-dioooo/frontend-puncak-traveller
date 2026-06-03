"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const response = await fetch("/api/puncak/me", {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Invalid session");
        }

        const payload = await response.json();
        
        if (payload.data.role === "admin") {
          if (active) {
            setAuthorized(true);
            setLoading(false);
          }
        } else {
          // If not an admin, redirect to member dashboard
          if (active) {
            router.replace("/account");
          }
        }
      } catch (error) {
        console.warn("API Auth check failed:", error);
        if (active) {
          router.replace("/login?return_to=/admin");
        }
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F5] text-slate-800 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#F37820] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide text-[#647589]">
            Verifying admin credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
