import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createTeamMemberSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createTeamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { festivalId, ...rest } = parsed.data;
  const member = await prisma.teamMember.create({
    data: {
      festivalId,
      ...rest,
      email: rest.email || null,
      phone: rest.phone || null,
      role: rest.role || null,
    },
  });

  return NextResponse.json(member, { status: 201 });
}
