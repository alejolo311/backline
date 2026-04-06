import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-normal tracking-tight text-gray-900">
            Encore
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestión de festivales y eventos
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
