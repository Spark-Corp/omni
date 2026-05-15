"use client";

import { Link, Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  MessageCircle,
  Bell,
  LogOut,
  Store,
  Map,
} from "lucide-react";
import styles from "./layout.module.css";

export default function VendorLayout() {
  const location = useLocation();

  const navItems = [
    { path: "/vendor/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/vendor/products", label: "Mes produits", icon: Package },
    { path: "/vendor/requests", label: "Demandes", icon: Bell },
    { path: "/vendor/messages", label: "Messages", icon: MessageCircle },
  ];

  const handleSignOut = async () => {
    await fetch("/api/auth/session", { method: "POST" });
    localStorage.removeItem("omni_user");
    window.location.href = "/";
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Store size={24} />
          <span>Omni Vendeur</span>
        </div>

        <Link to="/map" className={styles.mapLink}>
          <Map size={16} />
          <span>Voir la carte</span>
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <button onClick={handleSignOut} className={styles.signOut}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}