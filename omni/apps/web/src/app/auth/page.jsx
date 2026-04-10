"use client";

import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Globe, Sparkles } from "lucide-react";
import { SimpleAuthWrapper } from "@/components/NeonAuthWrapper";

export default function AuthPage() {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate("/map");
  };

  return (
    <div className="min-h-screen bg-[#050510] flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Globe className="text-white" size={24} />
              </div>
              <span className="text-2xl font-semibold text-white">Omni</span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Bienvenue sur{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Omni
              </span>
            </h1>

            <p className="text-lg text-white/50 mb-8">
              Connectez-vous pour accéder à la carte interactive et découvrir 
              les vendeurs autour de vous en temps réel.
            </p>

            <div className="flex items-center gap-4 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-400" />
                <span>Carte 3D Globe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% Gratuit</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe className="text-white" size={20} />
            </div>
            <span className="text-xl font-semibold text-white">Omni</span>
          </div>

          {/* Auth Wrapper - No React Router conflicts */}
          <SimpleAuthWrapper onAuthSuccess={handleAuthSuccess} />

          <div className="mt-8 text-center">
            <a href="/" className="text-sm text-white/30 hover:text-white/50 transition-colors">
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
