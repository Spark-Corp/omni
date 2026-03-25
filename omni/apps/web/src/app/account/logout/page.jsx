"use client";

import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Se déconnecter
        </h1>
        <p className="text-gray-600 mb-8">
          Êtes-vous sûr de vouloir vous déconnecter?
        </p>

        <button
          onClick={handleSignOut}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Confirmer la déconnexion
        </button>
      </div>
    </div>
  );
}
