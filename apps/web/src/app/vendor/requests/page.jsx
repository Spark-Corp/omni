"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  MessageCircle,
} from "lucide-react";
import useUser from "@/utils/useUser";
import ChatModal from "@/components/ChatModal";

export default function VendorRequestsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (user && !userLoading) {
      loadRequests();
    }
  }, [user, userLoading]);

  const loadRequests = async () => {
    try {
      const response = await fetch("/api/vendors/requests");
      if (!response.ok) throw new Error("Failed to load requests");

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, status, quantityConfirmed = null) => {
    setLoading(true);
    try {
      const response = await fetch("/api/availability/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status,
          quantityConfirmed,
        }),
      });

      if (!response.ok) throw new Error("Failed to respond");

      await loadRequests();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la réponse");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <a href="/vendor/dashboard">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={24} className="text-gray-700" />
              </button>
            </a>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Demandes de disponibilité
              </h1>
              <p className="text-gray-600">
                {requests.length} demande{requests.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {["pending", "confirmed", "denied"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-lg font-semibold ${
                status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : status === "confirmed"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {status === "pending"
                ? "En attente"
                : status === "confirmed"
                  ? "Confirmées"
                  : "Refusées"}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500">Aucune demande pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {req.product_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantité demandée: {req.quantity_requested}{" "}
                      {req.product_unit}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(req.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      req.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : req.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {req.status === "pending"
                      ? "En attente"
                      : req.status === "confirmed"
                        ? "Confirmé"
                        : "Refusé"}
                  </span>
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleRespond(
                          req.id,
                          "confirmed",
                          req.quantity_requested,
                        )
                      }
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Confirmer
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, "denied")}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Refuser
                    </button>
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="px-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                    </button>
                  </div>
                )}

                {req.status !== "pending" && req.quantity_confirmed && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-sm text-emerald-700">
                      Quantité confirmée: {req.quantity_confirmed}{" "}
                      {req.product_unit}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {selectedRequest && (
        <ChatModal
          requestId={selectedRequest.id}
          vendorName="Client"
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}
