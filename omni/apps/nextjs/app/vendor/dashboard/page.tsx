"use client";

import { useState, useEffect } from "react";
import {
  Power,
  PowerOff,
  Package,
  MessageCircle,
  TrendingUp,
  Loader2,
  Plus,
  Edit,
} from "lucide-react";
import Link from "next/link";
import useUser from "@/utils/useUser";

export default function VendorDashboardPage() {
  const { data: user, loading: userLoading } = useUser();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (user && !userLoading) {
      loadVendorData();
    }
  }, [user, userLoading]);

  const loadVendorData = async () => {
    try {
      const response = await fetch("/api/vendors/my-vendor");
      if (!response.ok) {
        throw new Error("Failed to load vendor");
      }
      const data = await response.json();
      setVendor(data.vendor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    setToggling(true);
    try {
      const response = await fetch("/api/vendors/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          isOnline: !vendor.is_online,
        }),
      });

      if (!response.ok) throw new Error("Failed to toggle status");

      const data = await response.json();
      setVendor({ ...vendor, is_online: data.vendor.is_online });
    } catch (err) {
      console.error(err);
      toast("Erreur lors du changement de statut");
    } finally {
      setToggling(false);
    }
  };

  if (userLoading || loading) {
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
          <p className="text-gray-600 mb-4">Veuillez vous connecter</p>
          <Link href="/auth?callbackUrl=/vendor/dashboard">
            <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold">
              Se connecter
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Aucune boutique trouvée
          </h2>
          <p className="text-gray-600 mb-6">
            Créez votre boutique pour commencer
          </p>
          <Link href="/vendor/onboarding">
            <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold">
              Créer ma boutique
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {vendor.name}
              </h1>
              <p className="text-gray-600">{vendor.category}</p>
            </div>
            <Link href="/auth">
              <button className="text-gray-600 hover:text-gray-900">
                Déconnexion
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Online/Offline Toggle - BIG */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Statut de votre boutique
              </h2>
              <p className="text-gray-600">
                {vendor.is_online
                  ? "Votre boutique est visible et les clients peuvent vous contacter"
                  : "Votre boutique est invisible pour les clients"}
              </p>
            </div>
            <button
              onClick={toggleOnlineStatus}
              disabled={toggling}
              className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                vendor.is_online
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                  : "bg-gray-300 hover:bg-gray-400"
              } ${toggling ? "opacity-50" : ""}`}
            >
              {vendor.is_online ? (
                <Power className="text-white" size={48} />
              ) : (
                <PowerOff className="text-gray-600" size={48} />
              )}
            </button>
          </div>
          <div className="mt-6 text-center">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${
                vendor.is_online
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full ${vendor.is_online ? "bg-emerald-500" : "bg-gray-400"}`}
              ></span>
              {vendor.is_online ? "EN LIGNE" : "HORS LIGNE"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MessageCircle className="text-blue-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-gray-600 text-sm">
                  Demandes aujourd'hui
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-gray-600 text-sm">Vues cette semaine</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Package className="text-emerald-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {vendor.products?.length || 0}
                </div>
                <div className="text-gray-600 text-sm">Produits actifs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Mes produits</h2>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
              <Plus size={20} />
              Ajouter un produit
            </button>
          </div>
          <div className="p-6">
            {vendor.products && vendor.products.length > 0 ? (
              <div className="space-y-4">
                {vendor.products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {product.category}
                      </p>
                      <p className="text-emerald-600 font-semibold mt-1">
                        {product.price} FCFA / {product.unit}
                      </p>
                    </div>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Edit size={20} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Aucun produit. Ajoutez votre premier produit pour commencer!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
