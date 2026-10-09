"use client";

import { useState } from "react";

import { z } from "zod";
import { Eye, EyeOff, Loader2, Plus } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useCreateUser } from "../hooks/use-create-user";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { onboardingUserSchema } from "../validations/user.validation";
import { CreateUserType, OnboardUserType } from "../types/user.type";
import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { RHFSelect } from "@/components/react-hook-form-fields/rhf-select";
import { ROLE_LABELS, ROLES } from "../../auth/constants/user-role";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useCreateUser();

  const form = useForm<OnboardUserType>({
    resolver: zodResolver(onboardingUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: ROLES.STORE_ADMIN,
    },
  });

  const onSubmit = async (values: OnboardUserType) => {
    try {
      const { confirmPassword, ...data } = values;

      await mutateAsync(data);
      toast.success("User created successfully");
      form.reset();

      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create user",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>

          <DialogDescription>Add a new user to your company.</DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <RHFInput<OnboardUserType>
              name="name"
              label="Full Name"
              placeholder="John Doe"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <RHFInput<OnboardUserType>
                name="email"
                label="Email"
                placeholder="john@example.com"
              />

              <RHFInput<OnboardUserType>
                name="phone"
                label="Phone"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <RHFSelect<OnboardUserType>
              name="role"
              label="Role"
              options={Object.entries(ROLE_LABELS).map(([value, label]) => ({
                label,
                value,
              }))}
              placeholder="Select role"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <RHFInput<OnboardUserType>
                name="password"
                type="password"
                label="Password"
              />

              <RHFInput<OnboardUserType>
                name="confirmPassword"
                type="password"
                label="Confirm Password"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
