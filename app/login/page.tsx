import Link from "next/link";
import { login } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
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
            StudyBuddy puts the teaching expertise into the platform — so
            structured, consistent lessons can be delivered by anyone,
            anywhere.
          </p>
        </div>
        <div className="relative flex items-center justify-between text-[13px] opacity-85">
          <span>University of Auckland · SOFTENG 700A</span>
          <Link href="/about" className="font-semibold underline underline-offset-2 hover:opacity-80">
            About this project
          </Link>
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
          <h1 className="mt-6 text-[23px] font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-[14.5px] text-muted">Sign in to continue</p>

          {searchParams?.error && (
            <p className="mt-4 rounded-input border border-rose bg-rose-soft px-3 py-2 text-sm text-[#946b76]">
              {searchParams.error}
            </p>
          )}

          <form action={login} className="mt-6 flex flex-col gap-3.5">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-[13px] font-semibold">
                Email
              </label>
              <input
                id="login-email" name="email"
                autoComplete="email"
                type="email"
                required
                className="w-full rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-[13px] font-semibold">
                Password
              </label>
              <input
                id="login-password" name="password"
                autoComplete="current-password"
                type="password"
                required
                className="w-full rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft"
              />
            </div>
            <button
              type="submit"
              className="mt-1.5 w-full rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52]"
            >
              Sign in →
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-muted">
            New facilitator?{" "}
            <Link href="/signup" className="font-semibold text-clay">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
