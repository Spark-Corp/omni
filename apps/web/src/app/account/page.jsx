"use client";
import { useEffect } from "react";

export default function AccountPage() {
  useEffect(() => {
    window.location.href = "/auth";
  }, []);
  
  return null;
}