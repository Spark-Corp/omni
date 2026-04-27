"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SignInPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp
  const { loading, error, signIn, sendOTP } = useAuth();
  const router = useRouter();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    // Validation téléphone simple
    if (!phone || phone.length < 8) {
      return;
    }

    // Envoyer OTP
    const result = await sendOTP(phone);
    
    if (result.success) {
      setStep("otp");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    // Valider OTP
    if (!otp || otp.length < 6) {
      return;
    }

    // Vérifier OTP
    const result = await signIn(phone, otp);
    
    if (result.success) {
      router.push("/vendor/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenue sur OMNI
          </h1>
          <p className="text-gray-600">
            {step === "phone" 
              ? "Entrez votre numéro pour commencer"
              : "Entrez le code reçu par SMS"
            }
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={step === "phone" ? handleSendOTP : handleVerifyOTP}>
          {step === "phone" ? (
            // Étape téléphone
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+228 00 00 00 00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Envoyer le code
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            // Étape OTP
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center text-xl tracking-widest"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Code envoyé au {phone}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Vérifier le code"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
              >
                ← Retour
              </button>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Info Sandbox */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-xs">
            💡 Mode test: utilisez le code <strong>123456</strong>
          </div>
        </form>
      </div>
    </div>
  );
}
