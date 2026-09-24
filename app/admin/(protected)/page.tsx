import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getActiveCompanyCount } from "@/features/company/service/get-companies.service";

export default async function AdminPage() {
  const activeClients = await getActiveCompanyCount();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />

      <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <img src="/logo.png" alt="Inventory Edge" className="h-20" />
        </header>

        {/* Hero */}
        <div className="mt-20 flex flex-1 flex-col justify-center">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Welcome Back
            </div>

            <h1 className="text-6xl font-extrabold tracking-tight text-slate-900">
              Welcome,
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Akhill
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Manage organizations and onboard new clients seamlessly.
            </p>
            <Button className="mt-3">
              <Link href={"/"}>Go to Login</Link>
            </Button>
          </div>

          {/* Action Card */}
          <Card className="mt-12 overflow-hidden rounded-[32px] border-0 bg-white/80 p-8 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Onboard a New Client
                </h2>

                <p className="mt-2 text-slate-500">
                  Create a new organization and start managing inventory
                  instantly.
                </p>
              </div>

              <Button
                size="lg"
                className="h-14 rounded-2xl px-8 text-base shadow-lg"
              >
                <Link href="/admin/onboard-company">
                  Onboard Client
                </Link>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>

          {/* Stats */}
          <div className="mt-8 max-w-sm">
            <Card className="rounded-3xl border-0 bg-white p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-blue-100 p-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Active Clients</p>

                  <h3 className="text-3xl font-bold text-slate-900">
                    {activeClients}
                  </h3>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
