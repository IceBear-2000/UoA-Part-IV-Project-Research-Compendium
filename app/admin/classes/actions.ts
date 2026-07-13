"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function createClass(name: string) {
  const admin = await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Class name is required.");

  const existing = await prisma.class.findFirst({
    where: { organisationId: admin.organisationId, name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) throw new Error(`"${trimmed}" already exists.`);

  await prisma.class.create({ data: { name: trimmed, organisationId: admin.organisationId } });

  revalidatePath("/admin/classes");
  revalidatePath("/admin/lessons");
}

export async function createSubject(classId: string, name: string) {
  await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Subject name is required.");

  const existing = await prisma.subject.findFirst({
    where: { classId, name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) throw new Error(`"${trimmed}" already exists in this class.`);

  await prisma.subject.create({ data: { name: trimmed, classId } });

  revalidatePath("/admin/classes");
  revalidatePath("/admin/lessons");
}
