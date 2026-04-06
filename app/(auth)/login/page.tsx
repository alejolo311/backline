import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fafb]">
      {/* Subtle teal glow in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.06] bg-brand-gradient blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.06] bg-brand-gradient blur-3xl" />
      </div>

      <div className="w-full max-w-sm px-6 relative">
        <div className="mb-8 text-center">
          {/* Logo mark */}
          <div className="flex justify-center mb-4">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="enc-login" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4DD5BB" />
                  <stop offset="1" stopColor="#3575B0" />
                </linearGradient>
              </defs>
              <path
                d="M6 6 L14 6 L6 14 Z M18 18 L26 26 L18 26 Z M8 24 L24 8"
                stroke="url(#enc-login)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#0F1C34]">
            Encore
          </h1>
          <p className="mt-1 text-sm text-[#5A8F8B]">
            Gestión de festivales y eventos
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#d0e8e5] shadow-sm p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
