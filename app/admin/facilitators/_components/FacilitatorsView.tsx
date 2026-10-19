"use client";

import { useState } from "react";
import { AssignModal } from "./AssignModal";

type Assignment = {
  id: string;
  class: { id: string; name: string };
  subject: { id: string; name: string };
};
type Facilitator = {
  id: string;
  name: string;
  email: string;
  assignments: Assignment[];
};
type ClassOption = { id: string; name: string; subjects: { id: string; name: string }[] };

function initials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

// Groups by class so a facilitator with Grade 1 · Maths and Grade 2 ·
// Science never renders as if they had both subjects in both grades —
// each class only ever shows the subjects actually assigned within it.
function groupByClass(assignments: Assignment[]) {
  const map = new Map<string, { id: string; name: string; subjects: string[] }>();
  for (const a of assignments) {
    if (!map.has(a.class.id)) map.set(a.class.id, { id: a.class.id, name: a.class.name, subjects: [] });
    map.get(a.class.id)!.subjects.push(a.subject.name);
  }
  return Array.from(map.values());
}

function ClassAssignments({ assignments }: { assignments: Assignment[] }) {
  const groups = groupByClass(assignments);
  // One switch per facilitator, not per class — clicking any class pill
  // opens every class for this facilitator at once, so you're not stuck
  // clicking through each one individually to see the whole picture.
  const [expanded, setExpanded] = useState(false);

  if (groups.length === 0) return <span className="text-sm text-muted">None yet</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {groups.map((g) => {
        const isOpen = expanded;
        return (
          <div
            key={g.id}
            className={`rounded-md border px-2 py-1 transition-colors ${
              isOpen ? "border-clay-line bg-clay-soft" : "border-line bg-bg-2"
            }`}
          >
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="flex items-center gap-1.5 text-[11.5px] font-semibold"
            >
              {g.name}
              <span className="text-muted">{isOpen ? "▾" : "▸"}</span>
            </button>
            {isOpen && (
              <div className="mt-1.5 flex flex-wrap gap-1 border-t border-clay-line pt-1.5">
                {g.subjects.map((s) => (
                  <span
                    key={s}
                    className="rounded-[5px] bg-surface px-1.5 py-0.5 text-[10.5px] font-medium text-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FacilitatorsView({
  facilitators,
  classes,
}: {
  facilitators: Facilitator[];
  classes: ClassOption[];
}) {
  const [view, setView] = useState<"list" | "card">("list");
  const [assigning, setAssigning] = useState<Facilitator | null>(null);

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div className="inline-flex rounded-[9px] bg-bg-2 p-[3px]">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-[7px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              view === "list" ? "bg-surface text-ink shadow-paper" : "text-muted"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView("card")}
            className={`rounded-[7px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              view === "card" ? "bg-surface text-ink shadow-paper" : "text-muted"
            }`}
          >
            Cards
          </button>
        </div>
      </div>

      {facilitators.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          No facilitators yet. They&apos;ll appear here once someone signs up.
        </div>
      ) : view === "list" ? (
        <table className="w-full border-collapse overflow-hidden rounded-card border border-line bg-surface shadow-paper">
          <thead>
            <tr>
              <th className="border-b border-line px-[18px] py-[13px] text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                Facilitator
              </th>
              <th className="border-b border-line px-[18px] py-[13px] text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                Assignments
              </th>
              <th className="border-b border-line px-[18px] py-[13px] text-left text-[11.5px] font-semibold uppercase tracking-wide text-muted" />
            </tr>
          </thead>
          <tbody>
            {facilitators.map((f) => (
              <tr key={f.id} className="hover:bg-bg">
                <td className="border-b border-line px-[18px] py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-full bg-sage text-[13px] font-semibold text-white">
                      {initials(f.name)}
                    </div>
                    <div>
                      <strong className="text-sm">{f.name}</strong>
                      <br />
                      <small className="text-muted">{f.email}</small>
                    </div>
                  </div>
                </td>
                <td className="border-b border-line px-[18px] py-3.5">
                  <ClassAssignments assignments={f.assignments} />
                </td>
                <td className="border-b border-line px-[18px] py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => setAssigning(f)}
                    className="rounded-input border border-line bg-white px-[13px] py-[7px] text-[13px] font-semibold shadow-paper hover:bg-bg-2"
                  >
                    Manage access
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="grid grid-cols-3 gap-[18px]">
          {facilitators.map((f) => (
            <div
              key={f.id}
              className="rounded-card border border-line bg-surface p-[21px] shadow-paper"
            >
              <div className="mb-3.5 flex items-center gap-3">
                <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-sage text-[15px] font-semibold text-white">
                  {initials(f.name)}
                </div>
                <div>
                  <strong className="text-sm">{f.name}</strong>
                  <br />
                  <small className="text-muted">{f.email}</small>
                </div>
              </div>
              <div className="mb-3.5">
                <ClassAssignments assignments={f.assignments} />
              </div>
              <button
                type="button"
                onClick={() => setAssigning(f)}
                className="w-full rounded-input border border-line bg-white py-2 text-[13px] font-semibold shadow-paper hover:bg-bg-2"
              >
                Manage access
              </button>
            </div>
          ))}
        </div>
      )}

      {assigning && (
        <AssignModal facilitator={assigning} classes={classes} onClose={() => setAssigning(null)} />
      )}
    </>
  );
}
