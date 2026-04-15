"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import useUser from "@/utils/useUser";

export default function VendorProductsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    unit: "unité",
  });

  useEffect(() => {
    if (user && !userLoading) {
      loadVendorData();
    }
  }, [user, userLoading]);

  const loadVendorData = async () => {
    try {
      const response = await fetch("/api/vendors/my-vendor");
      if (!response.ok) throw new Error("Failed to load vendor");

      const data = await response.json();
      setVendor(data.vendor);
      setProducts(data.vendor.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingProduct
        ? `/api/vendors/products/${editingProduct.id}`
        : "/api/vendors/products/create";

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (!response.ok) throw new Error("Failed to save product");

      await loadVendorData();
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: "", category: "", price: "", unit: "unité" });
    } catch (err) {
      console.error(err);
      toast("Erreur lors de la sauvegarde du produit");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    toast.warning(" Suppression en cours...)

    setLoading(true);
    try {
      const response = await fetch(`/api/vendors/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      await loadVendorData();
    } catch (err) {
      console.error(err);
      toast("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (product) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/vendors/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          isAvailable: !product.is_available,
        }),
      });

      if (!response.ok) throw new Error("Failed to update availability");

      await loadVendorData();
    } catch (err) {
      console.error(err);
      toast("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  if (!user || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Veuillez vous connecter</p>
          <Link href="/vendor/dashboard">
            <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold">
              Retour au dashboard
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
            <div className="flex items-center gap-4">
              <Link href="/vendor/dashboard">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft size={24} className="text-gray-700" />
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Mes produits
                </h1>
                <p className="text-gray-600">{vendor.name}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingProduct(null);
                setFormData({
                  name: "",
                  category: "",
                  price: "",
                  unit: "unité",
                });
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              <Plus size={20} />
              Nouveau produit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 mb-4">Aucun produit pour le moment</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Ajouter votre premier produit
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {product.category}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleAvailability(product)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.is_available
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {product.is_available ? "Disponible" : "Indisponible"}
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl font-bold text-emerald-600">
                      {product.price} FCFA
                    </div>
                    <div className="text-sm text-gray-500">
                      par {product.unit}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProduct ? "Modifier le produit" : "Nouveau produit"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit *
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Riz local"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Ex: Alimentation"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (FCFA) *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="Ex: 2500"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="Ex: sac, kg, pièce"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
