"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Power,
  PowerOff,
  Loader2,
  Plus,
  FileText,
  MessageSquare,
  Store,
  Edit,
  Trash2,
  Package,
} from "lucide-react";

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [stats, setStats] = useState({ requests: 0, messages: 0 });

  // Inline product management
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: "", price: "", unit: "pièce" });
  const [productError, setProductError] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = async () => {
    try {
      const storedUser = localStorage.getItem("omni_user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      const response = await fetch("/api/vendors/my-vendor", {
        headers: userId ? { 'x-user-id': userId } : {},
      });

      if (!response.ok) {
        setVendor(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setVendor(data.vendor);

      if (data.vendor) {
        const requestsRes = await fetch("/api/vendors/requests", {
          headers: userId ? { 'x-user-id': userId } : {},
        });
        const requestsData = await requestsRes.json();

        const convsRes = await fetch("/api/vendors/conversations", {
          headers: userId ? { 'x-user-id': userId } : {},
        });
        const convsData = await convsRes.json();

        setStats({
          requests: requestsData.requests?.length || 0,
          messages: convsData.conversations?.length || 0,
        });
      }
    } catch (err) {
      console.error(err);
      setVendor(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    const storedUser = localStorage.getItem("omni_user");
    const userId = storedUser ? JSON.parse(storedUser).id : null;

    setToggling(true);
    try {
      const response = await fetch("/api/vendors/toggle-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { 'x-user-id': userId } : {})
        },
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
    } finally {
      setToggling(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setProductError("");
    setSavingProduct(true);

    try {
      const storedUser = localStorage.getItem("omni_user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      const url = editingProduct
        ? `/api/vendors/products/${editingProduct.id}`
        : "/api/vendors/products/create";

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { 'x-user-id': userId } : {})
        },
        body: JSON.stringify({
          vendorId: vendor.id,
          ...productForm,
          price: parseFloat(productForm.price),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur");
      }

      await loadVendorData();
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: "", price: "", unit: "pièce" });
    } catch (err) {
      setProductError(err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Supprimer ce produit ?")) return;

    try {
      const storedUser = localStorage.getItem("omni_user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      const response = await fetch(`/api/vendors/products/${productId}`, {
        method: "DELETE",
        headers: userId ? { 'x-user-id': userId } : {},
      });

      if (!response.ok) throw new Error("Erreur");

      await loadVendorData();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      unit: product.unit || "pièce",
    });
    setShowProductForm(true);
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", price: "", unit: "pièce" });
    setShowProductForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-400" size={32} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <Store size={28} className="text-emerald-400" />
          </div>
          <h2 className="font-space-grotesk text-2xl font-bold text-white mb-2">
            Aucune boutique trouvée
          </h2>
          <p className="font-dm-sans text-sm text-zinc-400 mb-8">
            Crée ta boutique pour commencer à vendre.
          </p>
          <Link
            to="/vendor/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all"
          >
            Créer ma boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-space-grotesk text-2xl md:text-3xl font-bold text-white">{vendor.name}</h1>
        <p className="font-dm-sans text-sm text-zinc-400 mt-1">{vendor.category}</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Online/Offline Toggle Card */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-space-grotesk text-xl font-bold text-white mb-1">
                Statut de ta boutique
              </h2>
              <p className="font-dm-sans text-sm text-zinc-400">
                {vendor.is_online
                  ? "Visible sur la carte pour les acheteurs"
                  : "Invisible — pas de nouveaux clients"}
              </p>
            </div>
            <button
              onClick={toggleOnlineStatus}
              disabled={toggling}
              className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                vendor.is_online
                  ? "bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-800 hover:bg-zinc-700"
              } ${toggling ? "opacity-50" : ""}`}
            >
              {toggling ? (
                <Loader2 size={28} className="animate-spin text-zinc-300" />
              ) : vendor.is_online ? (
                <Power className="text-black" size={36} />
              ) : (
                <PowerOff className="text-zinc-400" size={36} />
              )}
            </button>
          </div>
          <div className="mt-6">
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-dm-sans ${
                vendor.is_online
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${vendor.is_online ? "bg-emerald-400" : "bg-zinc-500"}`} />
              {vendor.is_online ? "EN LIGNE" : "HORS LIGNE"}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FileText size={22} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-dm-sans text-sm text-zinc-400">Demandes</p>
                <p className="font-space-grotesk text-3xl font-bold text-white">{stats.requests}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <MessageSquare size={22} className="text-blue-400" />
              </div>
              <div>
                <p className="font-dm-sans text-sm text-zinc-400">Messages</p>
                <p className="font-space-grotesk text-3xl font-bold text-white">{stats.messages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Card — full management inline */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="font-space-grotesk text-lg font-bold text-white">Mes produits</h2>
            <button
              onClick={openAddProduct}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all"
            >
              <Plus size={16} />
              Ajouter
            </button>
          </div>

          {/* Inline product form */}
          {showProductForm && (
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Package size={16} className="text-emerald-400" />
                <h3 className="font-space-grotesk font-bold text-zinc-300 text-sm">
                  {editingProduct ? "Modifier le produit" : "Nouveau produit"}
                </h3>
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 sm:col-span-1">
                    <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 transition-all focus-within:border-emerald-500/50">
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="Nom du produit"
                        className="w-full bg-transparent border-none outline-none text-zinc-200 text-sm placeholder:text-zinc-600 font-dm-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 transition-all focus-within:border-emerald-500/50">
                      <input
                        type="number"
                        required
                        min="0"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        placeholder="Prix (FCFA)"
                        className="w-full bg-transparent border-none outline-none text-zinc-200 text-sm placeholder:text-zinc-600 font-dm-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5">
                      <select
                        value={productForm.unit}
                        onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                        className="w-full bg-transparent border-none outline-none text-zinc-400 text-sm font-dm-sans appearance-none"
                      >
                        <option value="pièce" className="bg-zinc-900">pièce</option>
                        <option value="kg" className="bg-zinc-900">kg</option>
                        <option value="litre" className="bg-zinc-900">litre</option>
                        <option value="sac" className="bg-zinc-900">sac</option>
                      </select>
                    </div>
                  </div>
                </div>

                {productError && (
                  <div className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10">
                    <p className="font-dm-sans text-sm text-red-400">{productError}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all disabled:opacity-50"
                  >
                    {savingProduct ? "..." : editingProduct ? "Enregistrer" : "Ajouter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      setProductForm({ name: "", price: "", unit: "pièce" });
                    }}
                    className="px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300 text-xs font-dm-sans transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products list */}
          <div className="p-6">
            {vendor.products && vendor.products.length > 0 ? (
              <div className="space-y-3">
                {vendor.products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-800/30 px-5 py-4 flex items-center justify-between transition-all hover:bg-zinc-800/50"
                  >
                    <div>
                      <h3 className="font-dm-sans font-medium text-zinc-200">{product.name}</h3>
                      <p className="font-dm-sans text-sm text-emerald-400 mt-1">
                        {product.price} FCFA / {product.unit}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditProduct(product)}
                        className="p-2 text-zinc-500 hover:text-emerald-400 transition-colors"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package size={32} className="mx-auto mb-3 text-zinc-600" />
                <p className="font-dm-sans text-sm text-zinc-500">
                  Aucun produit. Ajoute ton premier produit.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
