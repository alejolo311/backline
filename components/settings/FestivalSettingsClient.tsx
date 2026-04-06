"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Festival } from "@prisma/client";
import { format } from "date-fns";
import { slugify } from "@/lib/utils";

const COVER_COLORS = [
  "#2BADA0", "#3575B0", "#4DD5BB", "#0F1C34",
  "#085041", "#712B13", "#72243E", "#27500A",
];

export function FestivalSettingsClient({ festival }: { festival: Festival }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [coverColor, setCoverColor] = useState(festival.coverColor);
  const [archiving, setArchiving] = useState(false);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slugInput = document.getElementById("slug-input") as HTMLInputElement;
    if (slugInput && !slugInput.dataset.manual) {
      slugInput.value = slugify(e.target.value);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const fd = new FormData(e.currentTarget);

    const body = {
      name: fd.get("name"),
      slug: fd.get("slug"),
      startDate: fd.get("startDate"),
      endDate: fd.get("endDate"),
      location: fd.get("location"),
      description: fd.get("description"),
      coverColor,
    };

    setLoading(true);
    try {
      const res = await fetch(`/api/festivals/${festival.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al guardar");
      } else {
        setSuccess(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive() {
    if (!confirm(festival.isArchived ? "¿Restaurar este festival?" : "¿Archivar este festival?")) return;
    setArchiving(true);
    await fetch(`/api/festivals/${festival.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !festival.isArchived }),
    });
    setArchiving(false);
    router.push("/dashboard");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar permanentemente "${festival.name}"? Esta acción no se puede deshacer.`)) return;
    if (!confirm("¿Estás completamente seguro? Se eliminarán todos los eventos.")) return;
    await fetch(`/api/festivals/${festival.id}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  }

  const inputCls = "w-full border border-[#c8e0dd] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2BADA0] focus:border-[#2BADA0] bg-white transition-colors";

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white border border-[#d0e8e5] rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#0F1C34] mb-1">Nombre *</label>
            <input name="name" required defaultValue={festival.name} onChange={handleNameChange} className={inputCls} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#0F1C34] mb-1">Slug (URL pública)</label>
            <input
              id="slug-input"
              name="slug"
              required
              defaultValue={festival.slug}
              pattern="[a-z0-9-]+"
              onChange={(e) => { e.target.dataset.manual = "1"; }}
              className={inputCls}
            />
            <p className="text-xs text-[#5A8F8B] mt-0.5">
              Programa público en: /p/{festival.slug}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F1C34] mb-1">Fecha inicio</label>
            <input name="startDate" type="date" defaultValue={format(festival.startDate, "yyyy-MM-dd")} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F1C34] mb-1">Fecha fin</label>
            <input name="endDate" type="date" defaultValue={format(festival.endDate, "yyyy-MM-dd")} className={inputCls} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#0F1C34] mb-1">Lugar</label>
            <input name="location" defaultValue={festival.location ?? ""} className={inputCls} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#0F1C34] mb-1">Descripción</label>
            <textarea name="description" defaultValue={festival.description ?? ""} rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#0F1C34] mb-2">Color del festival</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COVER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCoverColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    coverColor === c ? "border-[#0F1C34] scale-110 shadow-md" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={coverColor}
                onChange={(e) => setCoverColor(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border border-[#c8e0dd]"
                title="Color personalizado"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-sm text-[#0A4A42] bg-[#E0F5F0] border border-[#2BADA0]/30 rounded-lg px-3 py-2">
            Cambios guardados.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="text-sm px-4 py-2 rounded-lg text-white disabled:opacity-60 transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #4DD5BB, #2BADA0)" }}
          >
            {loading ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="border border-red-200 rounded-xl p-5">
        <h2 className="font-medium text-sm text-red-700 mb-4">Zona de peligro</h2>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium text-[#0F1C34]">
              {festival.isArchived ? "Restaurar festival" : "Archivar festival"}
            </p>
            <p className="text-xs text-[#5A8F8B]">
              {festival.isArchived ? "Moverlo de vuelta a activos" : "Ocultarlo del listado principal"}
            </p>
          </div>
          <button
            onClick={handleArchive}
            disabled={archiving}
            className="text-sm px-3 py-1.5 rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors disabled:opacity-60"
          >
            {festival.isArchived ? "Restaurar" : "Archivar"}
          </button>
        </div>

        <div className="border-t border-red-100 mt-4 pt-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium text-red-700">Eliminar festival</p>
            <p className="text-xs text-[#5A8F8B]">
              Elimina permanentemente el festival y todos sus eventos.
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="text-sm px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
