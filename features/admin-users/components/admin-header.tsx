"use client";

import { BarChart3, Building2, House, LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { AdminLogoutButton } from "./logout-button";

type NavItem = { href: string; label: string; icon: LucideIcon };

const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Home", icon: House },
  { href: "/admin/usage", label: "Usage dashboard", icon: BarChart3 },
  { href: "/admin/onboard-company", label: "Onboard client", icon: Building2 },
];

function isActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/admin" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Inventory Edge"
            width={120}
            height={48}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav className="flex items-center gap-1">
          {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only md:not-sr-only">{label}</span>
              </Link>
            );
          })}
        </nav>

        <AdminLogoutButton />
      </div>
    </header>
  );
}
