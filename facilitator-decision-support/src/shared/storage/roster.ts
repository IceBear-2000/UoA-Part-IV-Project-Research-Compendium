"use client";

import type { ClassRecord, Roster, StudentRecord } from "@/shared/types/activity";

const rosterStorageKey = "partiv.roster";
const listeners = new Set<() => void>();
const emptyServerRoster = createDefaultRoster();
let cachedRawRoster: string | null = null;
let cachedRoster: Roster = createDefaultRoster();

function createDefaultRoster(): Roster {
  const createdAt = "2026-07-23T00:00:00.000Z";

  return {
    classes: [
      {
        id: "class-rimu",
        name: "Rimu Reading Group",
        createdAt,
      },
      {
        id: "class-kowhai",
        name: "Kowhai Reading Group",
        createdAt,
      },
    ],
    students: [
      {
        id: "student-1",
        name: "Student 1",
        classId: "class-rimu",
        createdAt,
      },
      {
        id: "student-2",
        name: "Student 2",
        classId: "class-rimu",
        createdAt,
      },
      {
        id: "student-3",
        name: "Student 3",
        classId: "class-kowhai",
        createdAt,
      },
    ],
  };
}

function parseRoster(rawRoster: string | null): Roster {
  if (!rawRoster) {
    return createDefaultRoster();
  }

  try {
    const parsedRoster = JSON.parse(rawRoster);
    const classes = Array.isArray(parsedRoster.classes)
      ? parsedRoster.classes
      : [];
    const students = Array.isArray(parsedRoster.students)
      ? parsedRoster.students
      : [];

    return {
      classes,
      students,
    };
  } catch {
    return createDefaultRoster();
  }
}

function notifyRosterListeners() {
  listeners.forEach((listener) => listener());
}

function persistRoster(roster: Roster) {
  window.localStorage.setItem(rosterStorageKey, JSON.stringify(roster));
  cachedRawRoster = null;
  notifyRosterListeners();
}

export function getRosterSnapshot(): Roster {
  const rawRoster = window.localStorage.getItem(rosterStorageKey);

  if (rawRoster === cachedRawRoster) {
    return cachedRoster;
  }

  cachedRawRoster = rawRoster;
  cachedRoster = parseRoster(rawRoster);
  return cachedRoster;
}

export function getServerRosterSnapshot(): Roster {
  return emptyServerRoster;
}

export function subscribeRoster(listener: () => void) {
  listeners.add(listener);

  function handleStorageChange(event: StorageEvent) {
    if (event.key === rosterStorageKey) {
      listener();
    }
  }

  window.addEventListener("storage", handleStorageChange);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function addClass(name: string): ClassRecord {
  const roster = getRosterSnapshot();
  const classRecord = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };

  persistRoster({
    ...roster,
    classes: [...roster.classes, classRecord],
  });

  return classRecord;
}

export function addStudent(name: string, classId: string): StudentRecord {
  const roster = getRosterSnapshot();
  const studentRecord = {
    id: crypto.randomUUID(),
    name: name.trim(),
    classId,
    createdAt: new Date().toISOString(),
  };

  persistRoster({
    ...roster,
    students: [...roster.students, studentRecord],
  });

  return studentRecord;
}
