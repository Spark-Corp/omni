import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";

export default function ImageSearch({ onSearchQuery }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // For now, show a helpful message
      // In production, this could use Google Cloud Vision or similar API
      alert(
        "🚧 Recherche par image arrive bientôt!\n\n" +
          "Pour l'instant, utilisez:\n" +
          "• Recherche texte pour trouver des produits\n" +
          "• Recherche vocale (icône micro)\n\n" +
          "La reconnaissance d'image nécessite une API externe (ex: Google Cloud Vision) qui sera ajoutée dans la prochaine version.",
      );

      // Reset file input
      if (e.target) {
        e.target.value = null;
      }
    } catch (err) {
      console.error("[ImageSearch] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
        disabled={loading}
        title="Recherche par image (bientôt disponible)"
      >
        {loading ? (
          <Loader2
            size={20}
            className="text-emerald-600"
            style={{ animation: "spin 1s linear infinite" }}
          />
        ) : (
          <Camera size={20} className="text-emerald-600" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
