"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setIsAuthenticated(true);
          } else {
            window.location.href = "/account/signin";
          }
        } else {
          window.location.href = "/account/signin";
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        window.location.href = "/account/signin";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050510]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-white/60 text-sm">Vérification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
