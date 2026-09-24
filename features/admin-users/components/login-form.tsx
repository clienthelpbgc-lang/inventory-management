"use client";

import Image from "next/image";
import { useState } from "react";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "../context/admin-auth-context";

interface AdminLoginFormData {
  email: string;
  password: string;
}

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const { login } = useAdminAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      setLoading(true);

      await login(data);

      window.location.href = "/admin";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign in",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-border/50 bg-background/95 p-4 shadow-2xl backdrop-blur">
      <CardHeader className="space-y-5 text-center">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Company Logo"
            width={250}
            height={250}
            priority
          />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Platform Admin
          </CardTitle>

          <CardDescription className="text-base">
            Sign in to access the admin portal
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="h-11"
              disabled={loading}
              {...register("email", {
                required: "Email is required",
              })}
            />

            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-11 pr-11"
                disabled={loading}
                {...register("password", {
                  required: "Password is required",
                })}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-9 w-9"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>

            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Admin Login"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
