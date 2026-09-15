import { LoginForm } from "@/features/auth/components/login-form";

export default function MainPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12">
      <img
        src="/bgc-logo.png"
        alt="BGC Logo"
        className="absolute left-6 top-6 h-10 w-auto object-contain"
      />

      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}