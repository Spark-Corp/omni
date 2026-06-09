"use client";

import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { User, Store } from "lucide-react";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [name, setName] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !name) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      // Store role in localStorage for onboarding
      localStorage.setItem("pendingRole", role);

      await signUpWithCredentials({
        email,
        password,
        name,
        callbackUrl: role === "seller" ? "/vendor/onboarding" : "/map",
        redirect: true,
      });
    } catch (err) {
      setError("Erreur lors de l'inscription. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl"
      >
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Créer un compte
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Rejoignez Omni aujourd'hui
        </p>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Je suis un(e):
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`p-4 rounded-lg border-2 transition-all ${
                role === "buyer"
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <User
                className={`mx-auto mb-2 ${role === "buyer" ? "text-emerald-600" : "text-gray-400"}`}
                size={32}
              />
              <div
                className={`font-semibold ${role === "buyer" ? "text-emerald-600" : "text-gray-700"}`}
              >
                Acheteur
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole("seller")}
              className={`p-4 rounded-lg border-2 transition-all ${
                role === "seller"
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Store
                className={`mx-auto mb-2 ${role === "seller" ? "text-emerald-600" : "text-gray-400"}`}
                size={32}
              />
              <div
                className={`font-semibold ${role === "seller" ? "text-emerald-600" : "text-gray-700"}`}
              >
                Vendeur
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Chargement..." : "Créer mon compte"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Vous avez déjà un compte?{" "}
            <a
              href="/account/signin"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Se connecter
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
