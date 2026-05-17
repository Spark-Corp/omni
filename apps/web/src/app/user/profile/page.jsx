"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Heart, MapPin, Loader2, LogOut } from "lucide-react";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("omni_user");
    if (!storedUser) {
      navigate("/auth");
      return;
    }
    
    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    fetch(`/api/favorites?userId=${userData.id}`, {
      headers: { 'x-user-id': userData.id }
    })
      .then(res => res.json())
      .then(data => setFavorites(data.favorites || []))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSignOut = async () => {
    await fetch("/api/auth/session", { method: "POST" });
    localStorage.removeItem("omni_user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>
          <div className="space-y-3">
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="ml-2">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Nom:</span>
              <span className="ml-2">{user?.name || "Non défini"}</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Heart className="text-red-500" size={20} />
            Mes boutiques favorites
          </h2>
          
          {favorites.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune boutique favorite. Explorez la carte pour en trouver!
            </p>
          ) : (
            <div className="space-y-4">
              {favorites.map((vendor) => (
                <div
                  key={vendor.id}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{vendor.name}</h3>
                    <p className="text-sm text-gray-500">{vendor.category}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/map?vendor=${vendor.id}`)}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    <MapPin size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}