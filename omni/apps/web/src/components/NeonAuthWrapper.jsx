"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * NeonAuthWrapper - Isolates Neon Auth UI in an iframe to avoid React Router v7 conflicts
 * 
 * This wrapper loads the Neon Auth UI in a sandboxed iframe, preventing
 * the useContext errors caused by React version mismatches.
 */
export function NeonAuthWrapper({ 
  onAuthSuccess, 
  onAuthError,
  redirectUrl = "/map" 
}) {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create the iframe content with Neon Auth UI
    const neonAuthUrl = import.meta.env.VITE_NEON_AUTH_URL;
    
    if (!neonAuthUrl) {
      setError("Neon Auth URL not configured");
      setIsLoading(false);
      return;
    }

    // Listen for messages from the iframe
    const handleMessage = (event) => {
      // Verify origin
      const allowedOrigins = [
        new URL(neonAuthUrl).origin,
        window.location.origin
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      const { type, data } = event.data;
      
      switch (type) {
        case 'NEON_AUTH_SUCCESS':
          onAuthSuccess?.(data);
          break;
        case 'NEON_AUTH_ERROR':
          onAuthError?.(data);
          break;
        case 'NEON_AUTH_LOADED':
          setIsLoading(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAuthSuccess, onAuthError]);

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300">
        <p className="font-semibold mb-2">Configuration Error</p>
        <p className="text-sm">{error}</p>
        <p className="text-sm mt-2">
          Please add VITE_NEON_AUTH_URL to your .env file
        </p>
      </div>
    );
  }

  const neonAuthUrl = import.meta.env.VITE_NEON_AUTH_URL;

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050510]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Chargement...</p>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={`${neonAuthUrl}/iframe?redirect=${encodeURIComponent(redirectUrl)}`}
        className="w-full h-full min-h-[500px] border-0 rounded-xl"
        sandbox="allow-scripts allow-same-origin allow-forms"
        title="Neon Auth"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

/**
 * SimpleAuthWrapper - Custom auth form using Neon Auth API directly
 * No iframe needed, no React context conflicts
 */
export function SimpleAuthWrapper({ 
  onAuthSuccess, 
  redirectUrl = "/map" 
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Dynamic import to avoid SSR issues
      const client = await import("@/lib/auth-client");
      const authClient = await client.default;
      
      if (isSignUp) {
        const result = await authClient.signUp({ email, password, name });
        if (result.error) {
          setError(result.error.message || "Erreur lors de l'inscription");
        } else {
          onAuthSuccess?.(result);
        }
      } else {
        const result = await authClient.signIn({ email, password });
        if (result.error) {
          setError(result.error.message || "Email ou mot de passe incorrect");
        } else {
          onAuthSuccess?.(result);
        }
      }
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer.");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isSignUp ? "Créer un compte" : "Se connecter"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm text-white/60 mb-2">Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                placeholder="Votre nom"
                required={isSignUp}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-white/60 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>{isSignUp ? "S'inscrire" : "Se connecter"}</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AuthGuard - Wrapper component that checks auth status before rendering children
 */
export function AuthGuard({ children, fallback = null }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const client = await import("@/lib/auth-client");
        const authClient = await client.default;
        const session = await authClient.getSession();
        setIsAuthenticated(!!session?.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-[#050510] p-4">
        <div className="text-center">
          <p className="text-white/60 mb-4">Veuillez vous connecter</p>
          <a 
            href="/auth" 
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-xl transition-all"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return children;
}
