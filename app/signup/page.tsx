import Link from "next/link";
import { requestAccess } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string; submitted?: string };
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-clay p-14 text-white md:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative flex items-center gap-2.5 text-lg font-bold tracking-tight">
          <div className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-white/20 text-base">
            📚
          </div>
          StudyBuddy
        </div>
        <div className="relative">
          <h2 className="max-w-[420px] text-[32px] font-bold leading-tight tracking-tight text-white">
            Quality lessons, ready for anyone to teach.
          </h2>
          <p className="mt-3.5 max-w-[380px] text-[15px] opacity-90">
            New facilitators are reviewed by a coordinator before getting
            access — request access below and you&apos;ll hear back by email.
          </p>
        </div>
        <div className="relative text-[13px] opacity-85">
          University of Auckland · SOFTENG 700A
        </div>
      </div>

      <div className="grid place-items-center p-10">
        <div className="w-full max-w-[356px]">
          <div className="flex items-center gap-2.5 text-[22px] font-bold tracking-tight">
            <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-clay text-base text-white">
              📚
            </div>
            StudyBuddy
          </div>

          {searchParams?.submitted ? (
            <>
              <div className="mt-6 grid h-14 w-14 place-items-center rounded-full bg-sage text-2xl text-white">
                ✓
              </div>
              <h1 className="mt-4 text-[23px] font-bold tracking-tight">
                Request sent
              </h1>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                A coordinator will review your request. If approved,
                you&apos;ll get an email with a link to set up your password
                and sign in.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-[13px] font-semibold text-clay"
              >
                ← Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 className="mt-6 text-[23px] font-bold tracking-tight">
                Request access
              </h1>
              <p className="mt-1 text-[14.5px] text-muted">
                Tell us a bit about yourself
              </p>

              {searchParams?.error && (
                <p className="mt-4 rounded-input border border-rose bg-rose-soft px-3 py-2 text-sm text-[#946b76]">
                  {searchParams.error}
                </p>
              )}

              <form action={requestAccess} className="mt-6 flex flex-col gap-3.5">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">
                    Which class/subject are you hoping to help with?
                    <span className="ml-1.5 rounded-[5px] bg-bg-2 px-[7px] py-[2px] text-[11px] font-medium text-muted">
                      Optional
                    </span>
                  </label>
                  <input
                    name="requestedClassNote"
                    type="text"
                    placeholder="e.g. Grade 1 Maths"
                    className="w-full rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
                  />
                </div>
                <SubmitButton label="Send request →" />
              </form>
            </>
          )}

          <p className="mt-5 text-center text-[13px] text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-clay">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
