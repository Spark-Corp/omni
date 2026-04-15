"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, Store, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import useUser from "@/utils/useUser";

export default function VendorOnboardingPage() {
  const router = useRouter();
  const { data: user, loading: userLoading } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Vendor info
  const [vendorName, setVendorName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);

  // Products
  const [products, setProducts] = useState([
    { name: "", category: "", price: "", unit: "unité" },
  ]);

  useEffect(() => {
    if (user && !userLoading) {
      // Check localStorage for pending role
      const pendingRole =
        typeof window !== "undefined"
          ? localStorage.getItem("pendingRole")
          : null;
      if (pendingRole === "seller") {
        localStorage.removeItem("pendingRole");
      }
    }
  }, [user, userLoading]);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Lome, Togo
          setLocation({ lat: 6.1319, lon: 1.2228 });
        },
      );
    } else {
      setLocation({ lat: 6.1319, lon: 1.2228 });
    }
  }, []);

  const addProduct = () => {
    setProducts([
      ...products,
      { name: "", category: "", price: "", unit: "unité" },
    ]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      if (!vendorName || !category || !location) {
        setError("Veuillez remplir tous les champs obligatoires");
        return;
      }
      setStep(2);
      return;
    }

    // Step 2: Create vendor and products
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/vendors/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: vendorName,
          category,
          description,
          lat: location.lat,
          lon: location.lon,
          products: products.filter((p) => p.name && p.price),
        }),
      });

      if (!response.ok) throw new Error("Failed to create vendor");

      const data = await response.json();

      // Redirect to dashboard
      router.push("/vendor/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création de votre boutique");
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Veuillez vous connecter pour continuer
          </p>
          <a href="/auth?callbackUrl=/vendor/onboarding">
            <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold">
              Se connecter
            </button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Étape {step} sur 2
            </span>
            <span className="text-sm text-gray-500">
              {step === 1 ? "Info boutique" : "Produits"}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${(step / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 ? "Créer votre boutique" : "Ajouter vos produits"}
          </h1>
          <p className="text-gray-600 mb-8">
            {step === 1
              ? "Commencez à être visible en moins de 3 minutes"
              : "Ajoutez au moins un produit pour commencer"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Store className="inline mr-2" size={18} />
                    Nom de votre boutique *
                  </label>
                  <input
                    required
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="Ex: Boutique Ama"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    <option value="Alimentation">Alimentation</option>
                    <option value="Electronique">Electronique</option>
                    <option value="Textile">Textile</option>
                    <option value="Santé & Beauté">Santé & Beauté</option>
                    <option value="Matériaux">Matériaux de construction</option>
                    <option value="Services">Services</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez ce que vous vendez..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline mr-2" size={18} />
                    Localisation
                  </label>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    {location ? (
                      <p className="text-emerald-700 text-sm">
                        ✓ Position détectée: {location.lat.toFixed(4)},{" "}
                        {location.lon.toFixed(4)}
                      </p>
                    ) : (
                      <p className="text-gray-600 text-sm">
                        Détection de votre position...
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          <Package className="inline mr-2" size={18} />
                          Produit {index + 1}
                        </h3>
                        {products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) =>
                            updateProduct(index, "name", e.target.value)
                          }
                          placeholder="Nom du produit"
                          className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-600"
                        />
                        <input
                          type="text"
                          value={product.category}
                          onChange={(e) =>
                            updateProduct(index, "category", e.target.value)
                          }
                          placeholder="Catégorie"
                          className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-600"
                        />
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) =>
                            updateProduct(index, "price", e.target.value)
                          }
                          placeholder="Prix (FCFA)"
                          className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-600"
                        />
                        <input
                          type="text"
                          value={product.unit}
                          onChange={(e) =>
                            updateProduct(index, "unit", e.target.value)
                          }
                          placeholder="Unité (kg, sac, pièce...)"
                          className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addProduct}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-emerald-600 text-gray-600 hover:text-emerald-600 py-3 rounded-lg font-semibold transition-colors"
                >
                  + Ajouter un autre produit
                </button>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading
                  ? "Chargement..."
                  : step === 1
                    ? "Continuer"
                    : "Créer ma boutique"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
