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

  const inputCls = "w-full border border-[#c8e0dd] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2BADA0]/30 focus:border-[#2BADA0] bg-white transition-colors";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-white text-sm px-3 py-1.5 rounded-lg transition-all hover:opacity-90 bg-brand-gradient"
      >
        <Plus size={14} />
        Nuevo festival
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1C34]/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-[#d0e8e5]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8f4f2]">
              <h2 className="font-serif text-lg text-[#0F1C34]">Nuevo festival</h2>
              <button onClick={() => setOpen(false)} className="text-[#5A8F8B] hover:text-[#0F1C34] transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0F1C34] mb-1">Nombre *</label>
                <input name="name" type="text" required onChange={handleNameChange} className={inputCls} placeholder="Festival del Sol 2025" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1C34] mb-1">Slug (URL pública) *</label>
                <input
                  id="slug-input"
                  name="slug"
                  type="text"
                  required
                  pattern="[a-z0-9-]+"
                  onChange={(e) => { e.target.dataset.manual = "1"; }}
                  className={inputCls}
                  placeholder="festival-del-sol-2025"
                />
                <p className="text-xs text-[#5A8F8B] mt-0.5">Solo minúsculas, números y guiones</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F1C34] mb-1">Inicio *</label>
                  <input name="startDate" type="date" required defaultValue={today} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F1C34] mb-1">Fin *</label>
                  <input name="endDate" type="date" required defaultValue={format(addDays(new Date(), 3), "yyyy-MM-dd")} className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1C34] mb-1">Lugar</label>
                <input name="location" type="text" className={inputCls} placeholder="Ciudad, lugar" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F1C34] mb-1">Descripción</label>
                <textarea name="description" rows={2} className={`${inputCls} resize-none`} />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm px-4 py-1.5 rounded-lg border border-[#c8e0dd] text-[#5A8F8B] hover:bg-[#f0f9f8] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="text-sm px-4 py-1.5 rounded-lg text-white bg-brand-gradient hover:opacity-90 disabled:opacity-60 transition-all"
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
