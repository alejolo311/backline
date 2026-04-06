"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TeamMember } from "@prisma/client";
import { Plus, Trash2, Pencil, Check, X, Phone, Mail, Briefcase } from "lucide-react";

type Props = {
  festivalId: string;
  initialMembers: TeamMember[];
};

export function TeamClient({ festivalId, initialMembers }: Props) {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      festivalId,
      name: fd.get("name"),
      role: fd.get("role") || undefined,
      phone: fd.get("phone") || undefined,
      email: fd.get("email") || undefined,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMembers((prev) => [...prev, data]);
        setShowAdd(false);
        (e.target as HTMLFormElement).reset();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      role: fd.get("role") || undefined,
      phone: fd.get("phone") || undefined,
      email: fd.get("email") || undefined,
    };

    setLoading(true);
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMembers((prev) => prev.map((m) => (m.id === id ? data : m)));
        setEditId(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar a "${name}" del equipo?`)) return;
    await fetch(`/api/team/${id}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div>
      <div className="space-y-3 mb-6">
        {members.length === 0 && !showAdd && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-400">Sin miembros de equipo aún</p>
          </div>
        )}

        {members.map((member) =>
          editId === member.id ? (
            <MemberForm
              key={member.id}
              defaultValues={member}
              onSubmit={(e) => handleEdit(e, member.id)}
              onCancel={() => setEditId(null)}
              loading={loading}
            />
          ) : (
            <div
              key={member.id}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {member.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{member.name}</div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
                  {member.role && (
                    <span className="flex items-center gap-0.5">
                      <Briefcase size={10} />
                      {member.role}
                    </span>
                  )}
                  {member.phone && (
                    <span className="flex items-center gap-0.5">
                      <Phone size={10} />
                      {member.phone}
                    </span>
                  )}
                  {member.email && (
                    <span className="flex items-center gap-0.5">
                      <Mail size={10} />
                      {member.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditId(member.id)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {showAdd ? (
        <MemberForm
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          loading={loading}
        />
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-sm text-[#3C3489] hover:text-[#322d70] transition-colors"
        >
          <Plus size={14} />
          Agregar miembro
        </button>
      )}
    </div>
  );
}

function MemberForm({
  defaultValues,
  onSubmit,
  onCancel,
  loading,
}: {
  defaultValues?: TeamMember;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
      className="bg-white border border-[#AFA9EC] rounded-lg px-4 py-3 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
          <input
            name="name"
            required
            autoFocus
            defaultValue={defaultValues?.name}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
          <input
            name="role"
            defaultValue={defaultValues?.role ?? ""}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
            placeholder="Técnico, Coordinador…"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
          <input
            name="phone"
            type="tel"
            defaultValue={defaultValues?.phone ?? ""}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={defaultValues?.email ?? ""}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#3C3489]"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="text-sm px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="text-sm px-3 py-1.5 rounded bg-[#3C3489] text-white hover:bg-[#322d70] disabled:opacity-60">
          {loading ? "Guardando…" : defaultValues ? "Guardar" : "Agregar"}
        </button>
      </div>
    </form>
  );
}
