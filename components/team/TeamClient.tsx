"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TeamMember } from "@prisma/client";
import { Plus, Trash2, Pencil, Phone, Mail, Briefcase } from "lucide-react";

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
          <div className="border-2 border-dashed border-[#d0e8e5] rounded-xl p-8 text-center">
            <p className="text-[#5A8F8B]">Sin miembros de equipo aún</p>
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
              className="bg-white border border-[#d0e8e5] rounded-xl px-4 py-3 flex items-center gap-3 hover:border-[#2BADA0]/40 transition-colors"
            >
              {/* Avatar circle with gradient */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 text-white"
                style={{ background: "linear-gradient(135deg, #4DD5BB, #3575B0)" }}
              >
                {member.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-[#0F1C34] truncate">{member.name}</div>
                <div className="flex items-center gap-3 text-xs text-[#5A8F8B] mt-0.5 flex-wrap">
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
                  className="p-1.5 text-[#8BBDB9] hover:text-[#2BADA0] rounded-lg hover:bg-[#E0F5F0] transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  className="p-1.5 text-[#8BBDB9] hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
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
          className="flex items-center gap-1.5 text-sm text-[#2BADA0] hover:text-[#1F8A7E] transition-colors"
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
  const inputCls = "w-full border border-[#c8e0dd] rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2BADA0] focus:border-[#2BADA0]";

  return (
    <form
      onSubmit={onSubmit}
      onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
      className="bg-white border border-[#2BADA0]/40 rounded-xl px-4 py-3 space-y-3 shadow-[0_0_0_3px_rgba(43,173,160,0.06)]"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#0F1C34] mb-1">Nombre *</label>
          <input name="name" required autoFocus defaultValue={defaultValues?.name} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#0F1C34] mb-1">Rol</label>
          <input name="role" defaultValue={defaultValues?.role ?? ""} className={inputCls} placeholder="Técnico, Coordinador…" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#0F1C34] mb-1">Teléfono</label>
          <input name="phone" type="tel" defaultValue={defaultValues?.phone ?? ""} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#0F1C34] mb-1">Email</label>
          <input name="email" type="email" defaultValue={defaultValues?.email ?? ""} className={inputCls} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="text-sm px-3 py-1.5 rounded-lg border border-[#c8e0dd] text-[#5A8F8B] hover:bg-[#f0f9f8]">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded-lg text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #4DD5BB, #2BADA0)" }}
        >
          {loading ? "Guardando…" : defaultValues ? "Guardar" : "Agregar"}
        </button>
      </div>
    </form>
  );
}
