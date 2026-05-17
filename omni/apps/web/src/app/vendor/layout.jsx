"use client";

import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  Store,
  Map,
} from "lucide-react";

export default function VendorLayout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: "/vendor/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/vendor/products", label: "Mes produits", icon: Package },
    { path: "/vendor/requests", label: "Demandes", icon: Bell },
    { path: "/vendor/messages", label: "Messages", icon: MessageCircle },
  ];

  const bottomItems = [
    { path: "/vendor/settings", label: "Paramètres", icon: Settings },
  ];

  const handleSignOut = async () => {
    await fetch("/api/auth/session", { method: "POST" });
    localStorage.removeItem("omni_user");
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-[#08080f]">
      <aside className="w-64 fixed h-screen flex flex-col border-r border-white/[0.06] bg-[#08080f] z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
          <Store size={22} className="text-emerald-400" />
          <span className="font-space-grotesk font-semibold text-base text-white/80">Omni Vendeur</span>
        </div>

        {/* Map link */}
        <Link
          to="/map"
          className="flex items-center gap-3 px-6 py-3 text-emerald-400/80 hover:text-emerald-400 text-sm border-b border-white/[0.06] transition-colors font-dm-sans"
        >
          <Map size={16} />
          <span>Voir la carte</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-dm-sans transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 font-medium"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom items */}
        <div className="px-3 py-2 space-y-0.5 border-t border-white/[0.06]">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-dm-sans transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 font-medium"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sign out */}
        <div className="px-3 py-3 border-t border-white/[0.06]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.06] w-full transition-all font-dm-sans"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen bg-[#0e0e18]">
        {children}
      </main>
    </div>
  );
}
