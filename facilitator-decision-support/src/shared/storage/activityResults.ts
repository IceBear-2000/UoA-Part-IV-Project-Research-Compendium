"use client";

import type { ActivityResult } from "@/shared/types/activity";

const storageKey = "partiv.activityResults";
// Large enough for a class of 30 to complete all three passages twice, so
// prior sessions are still available when the engine pools passages.
const maxStoredResults = 200;
const listeners = new Set<() => void>();
const emptyServerResults: ActivityResult[] = [];
let cachedRawResults: string | null = null;
let cachedResults: ActivityResult[] = [];

function parseActivityResults(rawResults: string | null): ActivityResult[] {
  if (!rawResults) {
    return [];
  }

  try {
    const parsedResults = JSON.parse(rawResults);
    return Array.isArray(parsedResults) ? parsedResults : [];
  } catch {
    return [];
  }
}

function notifyActivityResultListeners() {
  listeners.forEach((listener) => listener());
}

export function getActivityResultsSnapshot(): ActivityResult[] {
  const rawResults = window.localStorage.getItem(storageKey);

  if (rawResults === cachedRawResults) {
    return cachedResults;
  }

  cachedRawResults = rawResults;
  cachedResults = parseActivityResults(rawResults);
  return cachedResults;
}

export function getServerActivityResultsSnapshot(): ActivityResult[] {
  return emptyServerResults;
}

export function subscribeActivityResults(listener: () => void) {
  listeners.add(listener);

  function handleStorageChange(event: StorageEvent) {
    if (event.key === storageKey) {
      listener();
    }
  }

  window.addEventListener("storage", handleStorageChange);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function loadActivityResults(): ActivityResult[] {
  return getActivityResultsSnapshot();
}

export function saveActivityResult(result: ActivityResult) {
  const existingResults = loadActivityResults();
  window.localStorage.setItem(
    storageKey,
    JSON.stringify([result, ...existingResults].slice(0, maxStoredResults)),
  );
  cachedRawResults = null;
  notifyActivityResultListeners();
}

/** Replaces every stored result whose session id starts with `idPrefix`
 * with `results` (newest first), keeping all other results. */
export function replaceActivityResultsWithPrefix(
  idPrefix: string,
  results: ActivityResult[],
) {
  const kept = loadActivityResults().filter(
    (result) => !result.response.id.startsWith(idPrefix),
  );
  window.localStorage.setItem(
    storageKey,
    JSON.stringify([...results, ...kept].slice(0, maxStoredResults)),
  );
  cachedRawResults = null;
  notifyActivityResultListeners();
}

export function clearActivityResults() {
  window.localStorage.removeItem(storageKey);
  cachedRawResults = null;
  notifyActivityResultListeners();
}
