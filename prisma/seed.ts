import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma.js";

const seed = async () => {
  const passwordHash = await bcrypt.hash("Admin123!", 12);
  const godmodeEmail = "kai@planbatery.com";
  const godmodePasswordHash = await bcrypt.hash(godmodeEmail, 12);

  await prisma.users.upsert({
    where: { email: "admin@example.com" },
    update: {
      password_hash: passwordHash,
      full_name: "Platform Admin",
      platform_role: "PLATFORM_ADMIN",
      is_active: true
    },
    create: {
      email: "admin@example.com",
      password_hash: passwordHash,
      full_name: "Platform Admin",
      platform_role: "PLATFORM_ADMIN"
    }
  });

  await prisma.users.upsert({
    where: { email: godmodeEmail },
    update: {
      password_hash: godmodePasswordHash,
      full_name: "Kai Godmode",
      platform_role: "PLATFORM_ADMIN",
      is_active: true
    },
    create: {
      email: godmodeEmail,
      password_hash: godmodePasswordHash,
      full_name: "Kai Godmode",
      platform_role: "PLATFORM_ADMIN"
    }
  });

  await prisma.units.upsert({
    where: { code: "m3" },
    update: {},
    create: {
      code: "m3",
      name: "Cubic meter",
      symbol: "m3",
      dimension: "volume"
    }
  });

  await prisma.units.upsert({
    where: { code: "kWh" },
    update: {},
    create: {
      code: "kWh",
      name: "Kilowatt hour",
      symbol: "kWh",
      dimension: "energy"
    }
  });
};

seed()
  .finally(async () => {
    await prisma.$disconnect();
  });
