import { PrismaClient, Category } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Create producer user
  const username = process.env.SEED_PRODUCER_USERNAME ?? "producer";
  const password = process.env.SEED_PRODUCER_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash, name: "Festival Producer" },
  });

  console.log(`✓ Producer user: ${user.username} (id: ${user.id})`);

  // Create a sample festival
  const startDate = new Date("2025-07-10");
  const festival = await prisma.festival.upsert({
    where: { slug: "festival-del-sol-2025" },
    update: {},
    create: {
      name: "Festival del Sol 2025",
      slug: "festival-del-sol-2025",
      startDate,
      endDate: addDays(startDate, 3),
      location: "Plaza Mayor, Bogotá",
      description: "Festival cultural anual de música, arte y tradición.",
      coverColor: "#3C3489",
    },
  });

  console.log(`✓ Festival: ${festival.name}`);

  // Create 4 days
  const dayLabels = ["Día 1", "Día 2", "Día 3", "Día 4"];
  const createdDays: { id: string; date: Date }[] = [];

  for (let i = 0; i < 4; i++) {
    const date = addDays(startDate, i);
    const day = await prisma.day.upsert({
      where: { id: `seed-day-${i + 1}` },
      update: { festivalId: festival.id, date, label: dayLabels[i], order: i },
      create: {
        id: `seed-day-${i + 1}`,
        festivalId: festival.id,
        date,
        label: dayLabels[i],
        order: i,
      },
    });
    createdDays.push({ id: day.id, date: day.date });
  }

  console.log(`✓ Created ${createdDays.length} days`);

  // Seed sample events for day 1
  const sampleEvents = [
    {
      title: "Apertura oficial",
      category: Category.cultural,
      startTime: "10:00",
      endTime: "11:00",
      venue: "Tarima Principal",
      order: 0,
    },
    {
      title: "Concierto de apertura",
      category: Category.musica,
      startTime: "12:00",
      endTime: "14:00",
      venue: "Tarima Principal",
      order: 1,
    },
    {
      title: "Torneo de fútbol",
      category: Category.deportes,
      startTime: "15:00",
      endTime: "17:00",
      venue: "Cancha municipal",
      order: 2,
    },
    {
      title: "Configuración tarima",
      category: Category.produccion,
      isInternal: true,
      internalOwner: "Carlos Técnico",
      internalNotes: "Verificar sistema de sonido antes de las 9am",
      order: 3,
    },
  ];

  for (const ev of sampleEvents) {
    await prisma.event.create({
      data: { dayId: createdDays[0].id, ...ev },
    });
  }

  console.log(`✓ Seeded ${sampleEvents.length} sample events`);

  // Seed day note for day 1
  await prisma.dayNote.upsert({
    where: { dayId: createdDays[0].id },
    update: {},
    create: {
      dayId: createdDays[0].id,
      content: "Confirmar permisos de uso del espacio con alcaldía",
    },
  });

  // Seed team members
  const teamMembers = [
    { name: "Carlos Técnico", role: "Técnico de Sonido", phone: "300-000-0001" },
    { name: "Ana Logística", role: "Coordinadora Logística", phone: "300-000-0002" },
    { name: "Pedro Seguridad", role: "Jefe de Seguridad", phone: "300-000-0003" },
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.create({
      data: { festivalId: festival.id, ...member },
    });
  }

  console.log(`✓ Seeded ${teamMembers.length} team members`);
  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
