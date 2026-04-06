"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { slugify } from "@/lib/utils";
import { format, addDays } from "date-fns";

export function CreateFestivalButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slugInput = document.getElementById("slug-input") as HTMLInputElement;
    if (slugInput && !slugInput.dataset.manual) {
      slugInput.value = slugify(e.target.value);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      slug: fd.get("slug"),
      startDate: fd.get("startDate"),
      endDate: fd.get("endDate"),
      location: fd.get("location"),
      description: fd.get("description"),
    };

    setLoading(true);
    try {
      const res = await fetch("/api/festivals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al crear festival");
      } else {
        setOpen(false);
        router.refresh();
        router.push(`/festival/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-[#3C3489] text-white text-sm px-3 py-1.5 rounded hover:bg-[#322d70] transition-colors"
      >
        <Plus size={14} />
        Nuevo festival
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-serif text-lg">Nuevo festival</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  name="name"
                  type="text"
                  required
                  onChange={handleNameChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C3489]"
                  placeholder="Festival del Sol 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL pública) *</label>
                <input
                  id="slug-input"
                  name="slug"
                  type="text"
                  required
                  pattern="[a-z0-9-]+"
                  onChange={(e) => { e.target.dataset.manual = "1"; }}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C3489]"
                  placeholder="festival-del-sol-2025"
                />
                <p className="text-xs text-gray-400 mt-0.5">Solo minúsculas, números y guiones</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inicio *</label>
                  <input
                    name="startDate"
                    type="date"
                    required
                    defaultValue={today}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C3489]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin *</label>
                  <input
                    name="endDate"
                    type="date"
                    required
                    defaultValue={format(addDays(new Date(), 3), "yyyy-MM-dd")}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C3489]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
                <input
                  name="location"
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C3489]"
                  placeholder="Ciudad, lugar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C3489] resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm px-4 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="text-sm px-4 py-1.5 rounded bg-[#3C3489] text-white hover:bg-[#322d70] transition-colors disabled:opacity-60"
                >
                  {loading ? "Creando…" : "Crear festival"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
