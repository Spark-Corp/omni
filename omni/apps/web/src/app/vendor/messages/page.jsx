"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import useUser from "@/utils/useUser";
import ChatModal from "@/components/ChatModal";

export default function VendorMessagesPage() {
  const { data: user, loading: userLoading } = useUser();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null);

  useEffect(() => {
    if (user && !userLoading) {
      loadConversations();
    }
  }, [user, userLoading]);

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/vendors/conversations");
      if (!response.ok) throw new Error("Failed to load conversations");

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error(err);
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
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">
                {conversations.length} conversation
                {conversations.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {conversations.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">Aucun message pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <div
                key={conv.request_id || `vendor-${conv.vendor_id}`}
                onClick={() => setSelectedConv(conv)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {conv.product_name || "Conversation générale"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {conv.last_message_preview}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.last_message_time).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {selectedConv && (
        <ChatModal
          requestId={selectedConv.request_id}
          vendorId={selectedConv.vendor_id}
          vendorName="Client"
          onClose={() => setSelectedConv(null)}
        />
      )}
    </div>
  );
}
