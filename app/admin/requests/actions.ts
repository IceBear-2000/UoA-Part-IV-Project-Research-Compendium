"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { Role, SignupRequestStatus } from "@prisma/client";

export async function approveRequest(
  requestId: string,
  assignments: { classId: string; subjectId: string }[],
) {
  const admin = await requireAdmin();

  const request = await prisma.signupRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== SignupRequestStatus.PENDING) {
    throw new Error("This request has already been reviewed.");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

  // This creates the real (unconfirmed) Supabase Auth user right now — we
  // use generateLink rather than inviteUserByEmail specifically so we get
  // the link back and can send our own branded email with it, instead of
  // also triggering Supabase's generic invite email.
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "invite",
    email: request.email,
    options: {
      redirectTo: `${siteUrl}/auth/confirm`,
      data: { name: request.name },
    },
  });

  if (linkError || !linkData?.user) {
    throw new Error(linkError?.message ?? "Could not create an account for this email.");
  }

  const newUser = await prisma.user.create({
    data: {
      authId: linkData.user.id,
      name: request.name,
      email: request.email,
      role: Role.FACILITATOR,
      organisationId: request.organisationId,
    },
  });

  if (assignments.length > 0) {
    await prisma.facilitatorAssignment.createMany({
      data: assignments.map((a) => ({
        facilitatorId: newUser.id,
        classId: a.classId,
        subjectId: a.subjectId,
      })),
      skipDuplicates: true,
    });
  }

  await prisma.signupRequest.update({
    where: { id: requestId },
    data: {
      status: SignupRequestStatus.APPROVED,
      reviewedByUserId: admin.id,
      reviewedAt: new Date(),
      createdUserId: newUser.id,
    },
  });

  const classRows =
    assignments.length > 0
      ? await prisma.class.findMany({ where: { id: { in: assignments.map((a) => a.classId) } } })
      : [];
  const subjectRows =
    assignments.length > 0
      ? await prisma.subject.findMany({
          where: { id: { in: assignments.map((a) => a.subjectId) } },
        })
      : [];

  const classAssignments = assignments.map((a) => ({
    className: classRows.find((c) => c.id === a.classId)?.name ?? "",
    subjectName: subjectRows.find((s) => s.id === a.subjectId)?.name ?? "",
  }));

  const emailResult = await sendApprovalEmail({
    to: request.email,
    name: request.name,
    classAssignments,
    inviteLink: linkData.properties.action_link,
  });

  // Sits unread until they actually log in for the first time — a small
  // "here's what you have access to" waiting for them on arrival.
  if (classAssignments.length > 0) {
    await createNotification({
      userId: newUser.id,
      body: `You've been approved and granted access to ${classAssignments
        .map((a) => `${a.className} · ${a.subjectName}`)
        .join(", ")}.`,
      link: "/facilitator",
    });
  }

  revalidatePath("/admin/requests");
  revalidatePath("/admin/facilitators");

  return { inviteLink: linkData.properties.action_link, emailSent: emailResult.sent };
}

export async function rejectRequest(requestId: string, reason: string) {
  const admin = await requireAdmin();

  const request = await prisma.signupRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== SignupRequestStatus.PENDING) {
    throw new Error("This request has already been reviewed.");
  }

  await prisma.signupRequest.update({
    where: { id: requestId },
    data: {
      status: SignupRequestStatus.REJECTED,
      reviewedByUserId: admin.id,
      reviewedAt: new Date(),
      rejectionReason: reason || null,
    },
  });

  await sendRejectionEmail({ to: request.email, name: request.name, reason: reason || null });

  revalidatePath("/admin/requests");
}
