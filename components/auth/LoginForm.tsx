"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const data = { username: fd.get("username") as string, password: fd.get("password") as string };

    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError("Usuario o contraseña incorrectos");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Usuario
        </label>
        <input
          name="username"
          type="text"
          autoComplete="username"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C3489] focus:border-transparent"
          placeholder="producer"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C3489] focus:border-transparent"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3C3489] text-white rounded px-4 py-2.5 text-sm font-medium hover:bg-[#322d70] transition-colors disabled:opacity-60"
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
