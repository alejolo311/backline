"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, LayoutDashboard } from "lucide-react";

export function ProducerNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[#d0e8e5] bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-[0_1px_0_rgba(43,173,160,0.08)]">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Wordmark with gradient */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 group"
          >
            {/* Logo mark — simplified version of the icon */}
            <span className="w-6 h-6 flex-shrink-0">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="enc-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4DD5BB" />
                    <stop offset="1" stopColor="#3575B0" />
                  </linearGradient>
                </defs>
                {/* Two triangles + diagonal slash — echoes the logo shape */}
                <path
                  d="M6 6 L14 6 L6 14 Z M18 18 L26 26 L18 26 Z M8 24 L24 8"
                  stroke="url(#enc-g)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-serif text-lg tracking-tight text-brand-gradient">
              Encore
            </span>
          </Link>

          {pathname !== "/dashboard" && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sm text-[#5A8F8B] hover:text-[#2BADA0] transition-colors"
            >
              <LayoutDashboard size={14} />
              <span>Festivales</span>
            </Link>
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 text-sm text-[#5A8F8B] hover:text-[#0F1C34] transition-colors"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
