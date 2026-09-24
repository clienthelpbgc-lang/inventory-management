"use client";

import { createContext, useContext, ReactNode } from "react";

import { createClient } from "@/lib/supabase/client";

type AdminLoginData = {
  email: string;
  password: string;
};

type AdminAuthContextType = {
  login: (data: AdminLoginData) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  async function login(data: AdminLoginData) {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw error;
    }

    // Membership in admin_users is checked server-side; the browser client
    // isn't allowed to read that table.
    const response = await fetch("/api/admin-me", { cache: "no-store" });

    if (!response.ok) {
      await supabase.auth.signOut();

      throw new Error("You are not authorized as a platform admin");
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
