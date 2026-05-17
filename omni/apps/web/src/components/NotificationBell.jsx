"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, MessageCircle, Package } from "lucide-react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    const storedUser = localStorage.getItem("omni_user");
    if (!storedUser) return;
    
    const userId = JSON.parse(storedUser).id;
    
    try {
      const res = await fetch("/api/notifications", {
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error("Load notifications error:", err);
    }
  };

  const markAsRead = async (id) => {
    const storedUser = localStorage.getItem("omni_user");
    const userId = JSON.parse(storedUser).id;
    
    await fetch(`/api/notifications?id=${id}`, {
      method: "PUT",
      headers: { 'x-user-id': userId }
    });
    loadNotifications();
  };

  const getIcon = (type) => {
    switch (type) {
      case "message": return <MessageCircle size={16} />;
      case "request": return <Package size={16} />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500">Aucune notification</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.is_read) markAsRead(notif.id);
                    if (notif.link) window.location.href = notif.link;
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    !notif.is_read ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400 mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notif.title}</p>
                      {notif.message && (
                        <p className="text-sm text-gray-500 mt-1">{notif.message}</p>
                      )}
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}