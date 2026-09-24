"use client";

import { Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useAdminAuth } from "../context/admin-auth-context";

export function AdminLogoutButton() {
  const { logout } = useAdminAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      window.location.href = "/admin/login";
    } catch {
      toast.error("Unable to sign out. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span className="sr-only sm:not-sr-only">Sign out</span>
    </Button>
  );
}
