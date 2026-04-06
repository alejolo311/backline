"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Festival } from "@prisma/client";
import { format } from "date-fns";
import { slugify } from "@/lib/utils";

const COVER_COLORS = [
  "#3C3489", "#085041", "#712B13", "#633806", "#27500A", "#72243E", "#1a1a2e",
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
    const confirmed = confirm(
      `¿Eliminar permanentemente "${festival.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    const confirmed2 = confirm("¿Estás completamente seguro? Se eliminarán todos los eventos.");
    if (!confirmed2) return;

    await fetch(`/api/festivals/${festival.id}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              name="name"
              required
              defaultValue={festival.name}
              onChange={handleNameChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL pública)</label>
            <input
              id="slug-input"
              name="slug"
              required
              defaultValue={festival.slug}
              pattern="[a-z0-9-]+"
              onChange={(e) => { e.target.dataset.manual = "1"; }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
            />
            <p className="text-xs text-gray-400 mt-0.5">
              Programa público en: /p/{festival.slug}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <input
              name="startDate"
              type="date"
              defaultValue={format(festival.startDate, "yyyy-MM-dd")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
            <input
              name="endDate"
              type="date"
              defaultValue={format(festival.endDate, "yyyy-MM-dd")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
            <input
              name="location"
              defaultValue={festival.location ?? ""}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="description"
              defaultValue={festival.description ?? ""}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C3489] resize-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Color del festival</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COVER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCoverColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    coverColor === c ? "border-gray-800 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={coverColor}
                onChange={(e) => setCoverColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-gray-300"
                title="Color personalizado"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">Cambios guardados.</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="text-sm px-4 py-2 rounded bg-[#3C3489] text-white hover:bg-[#322d70] disabled:opacity-60 transition-colors"
          >
            {loading ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="border border-red-200 rounded-lg p-5">
        <h2 className="font-medium text-sm text-red-700 mb-4">Zona de peligro</h2>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium">
              {festival.isArchived ? "Restaurar festival" : "Archivar festival"}
            </p>
            <p className="text-xs text-gray-500">
              {festival.isArchived
                ? "Moverlo de vuelta a activos"
                : "Ocultarlo del listado principal"}
            </p>
          </div>
          <button
            onClick={handleArchive}
            disabled={archiving}
            className="text-sm px-3 py-1.5 rounded border border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors disabled:opacity-60"
          >
            {festival.isArchived ? "Restaurar" : "Archivar"}
          </button>
        </div>

        <div className="border-t border-red-100 mt-4 pt-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium text-red-700">Eliminar festival</p>
            <p className="text-xs text-gray-500">
              Esta acción elimina permanentemente el festival y todos sus eventos.
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="text-sm px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
