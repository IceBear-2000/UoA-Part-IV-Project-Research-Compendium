import { Resend } from "resend";

// Every function here no-ops (with a console log) when RESEND_API_KEY isn't
// set, so the approval/rejection flow works and is fully testable before
// real email is wired up — see chat: "skip email for now" was rejected in
// favour of Resend, but we still don't want to hard-block on it.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || "StudyBuddy <onboarding@resend.dev>";

export async function sendApprovalEmail({
  to,
  name,
  classAssignments,
  inviteLink,
}: {
  to: string;
  name: string;
  classAssignments: { className: string; subjectName: string }[];
  inviteLink: string;
}) {
  if (!resend) {
    console.log(
      `[email] RESEND_API_KEY not set — skipping approval email to ${to}. Invite link: ${inviteLink}`,
    );
    return { sent: false as const, inviteLink };
  }

  const classList = classAssignments.map((a) => `${a.className} · ${a.subjectName}`).join(", ");

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "You're approved as a StudyBuddy facilitator",
    html: `
      <p>Kia ora ${name},</p>
      <p>Your request to join StudyBuddy as a facilitator has been approved. You've been given access to:</p>
      <p><strong>${classList || "No classes assigned yet"}</strong></p>
      <p><a href="${inviteLink}">Click here to set your password and sign in</a></p>
      <p>This link is single-use and will expire after a while. If it's stopped working, ask your coordinator to resend it.</p>
    `,
  });

  return { sent: true as const, inviteLink };
}

export async function sendRejectionEmail({
  to,
  name,
  reason,
}: {
  to: string;
  name: string;
  reason: string | null;
}) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — skipping rejection email to ${to}.`);
    return { sent: false as const };
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Your StudyBuddy access request",
    html: `
      <p>Kia ora ${name},</p>
      <p>Your request to join StudyBuddy wasn't approved this time.</p>
      ${reason ? `<p>${reason}</p>` : ""}
      <p>If you think this is a mistake, reach out to your coordinator directly.</p>
    `,
  });

  return { sent: true as const };
}
