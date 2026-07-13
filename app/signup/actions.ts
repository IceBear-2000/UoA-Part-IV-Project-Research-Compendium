"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SignupRequestStatus } from "@prisma/client";

// No password here, and no Supabase Auth account gets created at this
// point — this just files a request. The real account is created by the
// admin's approval action (see app/admin/requests/actions.ts), which is
// also where a real authId first exists. This intentionally replaces the
// old self-serve signup — see chat: "request first, invite later".
export async function requestAccess(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const requestedClassNote = String(formData.get("requestedClassNote") ?? "").trim();

  if (!name || !email) {
    redirect(`/signup?error=${encodeURIComponent("Name and email are required.")}`);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    redirect(
      `/signup?error=${encodeURIComponent("An account with this email already exists — try signing in instead.")}`,
    );
  }

  const existingPending = await prisma.signupRequest.findFirst({
    where: { email, status: SignupRequestStatus.PENDING },
  });
  if (existingPending) {
    redirect(
      `/signup?error=${encodeURIComponent("You already have a pending request — an admin will review it soon.")}`,
    );
  }

  const organisation = await prisma.organisation.findFirst();
  if (!organisation) {
    redirect(`/signup?error=${encodeURIComponent("No organisation configured yet.")}`);
  }

  await prisma.signupRequest.create({
    data: {
      name,
      email,
      requestedClassNote: requestedClassNote || null,
      organisationId: organisation!.id,
    },
  });

  redirect("/signup?submitted=1");
}
