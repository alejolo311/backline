"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, LayoutDashboard } from "lucide-react";

export function ProducerNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="font-serif text-lg text-gray-900 hover:text-[#3C3489] transition-colors"
          >
            Encore
          </Link>
          {pathname !== "/dashboard" && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LayoutDashboard size={14} />
              <span>Festivales</span>
            </Link>
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
