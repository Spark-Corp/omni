"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";

export default function ChatModal({
  requestId,
  vendorId,
  vendorName,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (requestId || vendorId) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [requestId, vendorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const params = requestId
        ? `requestId=${requestId}`
        : `vendorId=${vendorId}`;
      const response = await fetch(`/api/chat/messages?${params}`);
      if (!response.ok) throw new Error("Failed to load messages");

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId || null,
          vendorId: vendorId || null,
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setNewMessage("");
      loadMessages();
    } catch (err) {
      console.error(err);
      toast("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-[#0e0e18] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-white/[0.06]"
        style={{ maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white/90">Chat</h2>
            <p className="text-white/40 text-sm">{vendorName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/[0.06] rounded-full transition-colors"
          >
            <X size={24} className="text-white/50" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/40 py-8">
              <p>Aucun message pour le moment</p>
              <p className="text-sm">Commencez la conversation !</p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.is_mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-lg px-4 py-2 ${
                  message.is_mine
                    ? "bg-emerald-600 text-white"
                    : "bg-white/[0.06] text-white/80"
                }`}
              >
                <p className="text-sm font-semibold mb-1 text-white/60">
                  {message.sender_name}
                </p>
                <p>{message.content}</p>
                <p className="text-xs mt-1 text-white/40">
                  {new Date(message.created_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 sm:p-6 border-t border-white/[0.06]">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-3 bg-white/[0.06] border border-white/[0.06] rounded-lg outline-none text-white/80 placeholder-white/30 focus:border-emerald-500/50 text-sm"
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0"
            >
              <Send size={20} />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
