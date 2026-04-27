"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import useUser from "@/utils/useUser";

export default function VendorPage() {
  const { data: user, loading } = useUser();

  useEffect(() => {
    const checkVendorStatus = async () => {
      if (!user) {
        // Not logged in - redirect to onboarding (which will redirect to signin)
        window.location.href = "/vendor/onboarding";
        return;
      }

      try {
        // Check if user has a vendor profile
        const response = await fetch("/api/vendors/my-vendor");
        if (response.ok) {
          // Has vendor - go to dashboard
          window.location.href = "/vendor/dashboard";
        } else {
          // No vendor - go to onboarding
          window.location.href = "/vendor/onboarding";
        }
      } catch (err) {
        console.error(err);
        // On error, default to onboarding
        window.location.href = "/vendor/onboarding";
      }
    };

    if (!loading) {
      checkVendorStatus();
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2
          className="mx-auto mb-4 text-emerald-600 animate-spin"
          size={48}
        />
        <p className="text-gray-600">Redirection...</p>
      </div>
    </div>
  );
}
