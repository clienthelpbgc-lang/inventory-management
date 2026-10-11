"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FieldValues, Path, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RHFInputProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  helperText?: string;
  type?: React.HTMLInputTypeAttribute;
  step?: string | number;
  disabled?: boolean;
  required?: boolean;
};

export function RHFInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  helperText,
  disabled = false,
  type = "text",
  step,
  required = false,
}: RHFInputProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const error = name.split(".").reduce<any>((obj, key) => obj?.[key], errors);

 const registerOptions =
  type === "number"
    ? {
        setValueAs: (value: unknown) =>
          value === "" || value == null ? undefined : Number(value),
      }
    : {
        setValueAs: (value: unknown) => {
          if (value == null) return undefined;

          const str = String(value).trim();
          return str === "" ? undefined : str;
        },
      };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={name}
          type={isPassword && showPassword ? "text" : type}
          step={step ?? (type === "number" ? "any" : undefined)}
          placeholder={placeholder}
          disabled={disabled}
          aria-required={required}
          autoComplete={isPassword ? "new-password" : undefined}
          className={isPassword ? "pr-10" : undefined}
          {...register(name, registerOptions)}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {error?.message ? (
        <p className="text-sm text-destructive">{String(error.message)}</p>
      ) : (
        helperText && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )
      )}
    </div>
  );
}
