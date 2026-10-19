"use client";

import { useState } from "react";
import { updateProfile, changePassword, updateOrganisationName } from "../actions";

const inputClasses =
  "w-full rounded-input border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-[3px] focus:ring-clay-soft";

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 rounded-card border border-line bg-surface p-[21px] shadow-paper">
      <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-[13px] text-muted">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FormMessage({ error, saved }: { error: string | null; saved: boolean }) {
  if (error) {
    return (
      <p className="mt-3 rounded-input border border-rose bg-rose-soft px-3 py-2 text-sm text-[#946b76]">
        {error}
      </p>
    );
  }
  if (saved) {
    return (
      <p className="mt-3 rounded-input border border-sage bg-sage-soft px-3 py-2 text-sm text-[#5f7355]">
        Saved.
      </p>
    );
  }
  return null;
}

function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile(name);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SettingsCard title="Profile" description="Your name as shown across StudyBuddy.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
        </div>
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="w-fit rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save name"}
        </button>
        <FormMessage error={error} saved={saved} />
      </form>
    </SettingsCard>
  );
}

function EmailCard({ email }: { email: string }) {
  return (
    <SettingsCard title="Email" description="Used to sign in. Contact another admin to change it.">
      <p className="rounded-input border border-line bg-bg-2 px-3 py-2.5 text-sm text-muted">{email}</p>
    </SettingsCard>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SettingsCard title="Password" description="Change your sign-in password.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClasses}
          />
        </div>
        <button
          type="submit"
          disabled={busy || !currentPassword || !newPassword || !confirmPassword}
          className="w-fit rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Changing…" : "Change password"}
        </button>
        <FormMessage error={error} saved={saved} />
      </form>
    </SettingsCard>
  );
}

function OrganisationForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateOrganisationName(name);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SettingsCard title="Organisation" description="Shown to facilitators across the platform.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold">Organisation name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
        </div>
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="w-fit rounded-input bg-clay px-4 py-2.5 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-clay-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save organisation name"}
        </button>
        <FormMessage error={error} saved={saved} />
      </form>
    </SettingsCard>
  );
}

export function SettingsView({
  name,
  email,
  organisationName,
}: {
  name: string;
  email: string;
  organisationName: string;
}) {
  return (
    <div className="max-w-[520px]">
      <ProfileForm initialName={name} />
      <EmailCard email={email} />
      <PasswordForm />
      <OrganisationForm initialName={organisationName} />
    </div>
  );
}
