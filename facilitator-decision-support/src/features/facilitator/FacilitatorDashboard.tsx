"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import {
  clearActivityResults,
  getActivityResultsSnapshot,
  getServerActivityResultsSnapshot,
  subscribeActivityResults,
} from "@/shared/storage/activityResults";
import {
  addClass,
  addStudent,
  getRosterSnapshot,
  getServerRosterSnapshot,
  subscribeRoster,
} from "@/shared/storage/roster";
import type {
  ActivityResult,
  ClassRecord,
  QuestionResponse,
  Roster,
} from "@/shared/types/activity";

type StudentProfile = {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  attempts: ActivityResult[];
  latestAttempt?: ActivityResult;
  averageAccuracy: number;
  averageConfidence: number;
  priorityCount: number;
  taskSignalCount: number;
};

const severityStyles = {
  high: "bg-rose-100 text-rose-900 border-rose-200",
  medium: "bg-amber-100 text-amber-950 border-amber-200",
  low: "bg-emerald-100 text-emerald-950 border-emerald-200",
};

function getQuestionResponses(result: ActivityResult): QuestionResponse[] {
  return Array.isArray(result.response.questionResponses)
    ? result.response.questionResponses
    : [];
}

function getCorrectCount(questions: QuestionResponse[]) {
  return questions.filter((question) => question.isCorrect).length;
}

function getAccuracy(result: ActivityResult) {
  const questions = getQuestionResponses(result);

  if (questions.length === 0) {
    return null;
  }

  return getCorrectCount(questions) / questions.length;
}

function getAccuracyLabel(result: ActivityResult) {
  const questions = getQuestionResponses(result);

  if (questions.length === 0) {
    return "Not captured";
  }

  return `${getCorrectCount(questions)}/${questions.length}`;
}

function getTotalHints(questions: QuestionResponse[]) {
  return questions.reduce((total, question) => total + question.hintCount, 0);
}

function getTotalAnswerChanges(questions: QuestionResponse[]) {
  return questions.reduce(
    (total, question) => total + question.answerChangeCount,
    0,
  );
}

function getTotalPassageRevisits(questions: QuestionResponse[]) {
  return questions.reduce(
    (total, question) => total + question.passageRevisitCount,
    0,
  );
}

function getAverageConfidence(questions: QuestionResponse[]) {
  if (questions.length === 0) {
    return 0;
  }

  return (
    questions.reduce((total, question) => total + question.confidence, 0) /
    questions.length
  );
}

function getAverageFirstInteraction(questions: QuestionResponse[]) {
  const capturedValues = questions
    .map((question) => question.firstInteractionSeconds)
    .filter((value): value is number => value !== null);

  if (capturedValues.length === 0) {
    return 0;
  }

  return (
    capturedValues.reduce((total, value) => total + value, 0) /
    capturedValues.length
  );
}

function hasHighPriority(result: ActivityResult) {
  return result.recommendation.indicators.some(
    (indicator) => indicator.severity === "high",
  );
}

function hasTaskProcessingSignal(result: ActivityResult) {
  return result.recommendation.indicators.some(
    (indicator) => indicator.id === "task-processing",
  );
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "Not captured";
  }

  return `${Math.round(value * 100)}%`;
}

function buildStudentProfiles(
  results: ActivityResult[],
  roster: Roster,
  selectedClassId: string,
): StudentProfile[] {
  const groupedResults = new Map<string, ActivityResult[]>();

  results.forEach((result) => {
    const profileKey = result.response.studentId ?? result.response.studentName;
    groupedResults.set(profileKey, [
      ...(groupedResults.get(profileKey) ?? []),
      result,
    ]);
  });

  const rosterProfiles = roster.students
    .filter(
      (student) => selectedClassId === "all" || student.classId === selectedClassId,
    )
    .map((student) => {
      const classRecord = roster.classes.find(
        (item) => item.id === student.classId,
      );

      return {
        studentId: student.id,
        studentName: student.name,
        classId: student.classId,
        className: classRecord?.name ?? "Unassigned",
        attempts: groupedResults.get(student.id) ?? [],
      };
    });
  const rosterProfileIds = new Set(
    rosterProfiles.map((profile) => profile.studentId),
  );
  const legacyProfiles = Array.from(groupedResults.entries())
    .filter(([studentId]) => !rosterProfileIds.has(studentId))
    .map(([studentId, attempts]) => {
      const sortedAttempts = [...attempts].sort(
        (first, second) =>
          new Date(second.response.submittedAt).getTime() -
          new Date(first.response.submittedAt).getTime(),
      );
      const accuracies = sortedAttempts
        .map(getAccuracy)
        .filter((value): value is number => value !== null);
      const allQuestions = sortedAttempts.flatMap(getQuestionResponses);
      const averageAccuracy =
        accuracies.length === 0
          ? 0
          : accuracies.reduce((total, value) => total + value, 0) /
            accuracies.length;

      return {
        studentId,
        studentName: sortedAttempts[0].response.studentName || "Unknown student",
        classId: sortedAttempts[0].response.classId ?? "unassigned",
        className: sortedAttempts[0].response.className ?? "Unassigned",
        attempts: sortedAttempts,
        averageAccuracy,
        averageConfidence: getAverageConfidence(allQuestions),
        priorityCount: sortedAttempts.filter(hasHighPriority).length,
        taskSignalCount: sortedAttempts.filter(hasTaskProcessingSignal).length,
      };
    });

  return [...rosterProfiles, ...legacyProfiles]
    .map((profile) => {
      const sortedAttempts = [...profile.attempts].sort(
        (first, second) =>
          new Date(second.response.submittedAt).getTime() -
          new Date(first.response.submittedAt).getTime(),
      );
      const accuracies = sortedAttempts
        .map(getAccuracy)
        .filter((value): value is number => value !== null);
      const allQuestions = sortedAttempts.flatMap(getQuestionResponses);
      const averageAccuracy =
        accuracies.length === 0
          ? 0
          : accuracies.reduce((total, value) => total + value, 0) /
            accuracies.length;

      return {
        ...profile,
        attempts: sortedAttempts,
        latestAttempt: sortedAttempts[0],
        averageAccuracy,
        averageConfidence: getAverageConfidence(allQuestions),
        priorityCount: sortedAttempts.filter(hasHighPriority).length,
        taskSignalCount: sortedAttempts.filter(hasTaskProcessingSignal).length,
      };
    })
    .sort(
      (first, second) =>
        (second.latestAttempt
          ? new Date(second.latestAttempt.response.submittedAt).getTime()
          : 0) -
        (first.latestAttempt
          ? new Date(first.latestAttempt.response.submittedAt).getTime()
          : 0),
    );
}

export function FacilitatorDashboard() {
  const results = useSyncExternalStore(
    subscribeActivityResults,
    getActivityResultsSnapshot,
    getServerActivityResultsSnapshot,
  );
  const roster = useSyncExternalStore(
    subscribeRoster,
    getRosterSnapshot,
    getServerRosterSnapshot,
  );
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [newClassName, setNewClassName] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentClassId, setNewStudentClassId] = useState(
    roster.classes[0]?.id ?? "",
  );

  const availableClasses: ClassRecord[] = roster.classes;
  const filteredResults = useMemo(
    () =>
      selectedClassId === "all"
        ? results
        : results.filter((result) => result.response.classId === selectedClassId),
    [results, selectedClassId],
  );
  const studentProfiles = useMemo(
    () => buildStudentProfiles(filteredResults, roster, selectedClassId),
    [filteredResults, roster, selectedClassId],
  );

  const classSummary = useMemo(() => {
    const allQuestions = filteredResults.flatMap(getQuestionResponses);

    return {
      completedAttempts: filteredResults.length,
      studentCount: studentProfiles.length,
      priorityProfiles: studentProfiles.filter((profile) => profile.priorityCount > 0)
        .length,
      taskSignalProfiles: studentProfiles.filter(
        (profile) => profile.taskSignalCount > 0,
      ).length,
      averageConfidence: getAverageConfidence(allQuestions),
    };
  }, [filteredResults, studentProfiles]);

  function handleClearDemoData() {
    clearActivityResults();
  }

  function handleAddClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newClassName.trim().length === 0) {
      return;
    }

    const classRecord = addClass(newClassName);
    setSelectedClassId(classRecord.id);
    setNewStudentClassId(classRecord.id);
    setNewClassName("");
  }

  function handleAddStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newStudentName.trim().length === 0 || newStudentClassId.length === 0) {
      return;
    }

    addStudent(newStudentName, newStudentClassId);
    setSelectedClassId(newStudentClassId);
    setNewStudentName("");
  }

  return (
    <main className="min-h-screen bg-[#f6f7f2] px-5 py-8 text-slate-950 sm:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
              Back to MVP overview
            </Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Facilitator dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold">Student support profiles</h1>
            <p className="mt-3 max-w-2xl text-slate-700">
              Each profile groups a learner&apos;s attempts so facilitators can inspect
              support signals now and identify trends later.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/student"
              className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Run student activity
            </Link>
            <button
              type="button"
              onClick={handleClearDemoData}
              className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold transition hover:bg-slate-100"
            >
              Clear demo data
            </button>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Student profiles</p>
            <p className="mt-2 text-3xl font-bold">{classSummary.studentCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Total attempts</p>
            <p className="mt-2 text-3xl font-bold">
              {classSummary.completedAttempts}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Priority profiles</p>
            <p className="mt-2 text-3xl font-bold">
              {classSummary.priorityProfiles}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Task signals</p>
            <p className="mt-2 text-3xl font-bold">
              {classSummary.taskSignalProfiles}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Average confidence</p>
            <p className="mt-2 text-3xl font-bold">
              {classSummary.averageConfidence.toFixed(1)}/4
            </p>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Class view</h2>
            <label
              className="mt-4 block text-sm font-semibold text-slate-700"
              htmlFor="class-filter"
            >
              Show dashboard for
            </label>
            <select
              id="class-filter"
              value={selectedClassId}
              onChange={(event) => setSelectedClassId(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="all">All classes</option>
              {availableClasses.map((classRecord) => (
                <option key={classRecord.id} value={classRecord.id}>
                  {classRecord.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <form
              onSubmit={handleAddClass}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-bold">Add class</h2>
              <label
                className="mt-4 block text-sm font-semibold text-slate-700"
                htmlFor="new-class"
              >
                Class name
              </label>
              <input
                id="new-class"
                value={newClassName}
                onChange={(event) => setNewClassName(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="Room 12 Reading Group"
              />
              <button
                type="submit"
                className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                Add class
              </button>
            </form>

            <form
              onSubmit={handleAddStudent}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-bold">Add student</h2>
              <label
                className="mt-4 block text-sm font-semibold text-slate-700"
                htmlFor="new-student"
              >
                Student name
              </label>
              <input
                id="new-student"
                value={newStudentName}
                onChange={(event) => setNewStudentName(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="Student 4"
              />
              <label
                className="mt-4 block text-sm font-semibold text-slate-700"
                htmlFor="new-student-class"
              >
                Assign to class
              </label>
              <select
                id="new-student-class"
                value={newStudentClassId || availableClasses[0]?.id}
                onChange={(event) => setNewStudentClassId(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {availableClasses.map((classRecord) => (
                  <option key={classRecord.id} value={classRecord.id}>
                    {classRecord.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                Add student
              </button>
            </form>
          </div>
        </section>

        {studentProfiles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-bold">No student activity yet</h2>
            <p className="mt-2 text-slate-600">
              Complete the student task once to generate the first support profile.
            </p>
            <Link
              href="/student"
              className="mt-5 inline-flex rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Start student demo
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {studentProfiles.map((profile) => {
              const latestQuestions = profile.latestAttempt
                ? getQuestionResponses(profile.latestAttempt)
                : [];

              return (
                <article
                  key={profile.studentId}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{profile.studentName}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {profile.className} · {profile.attempts.length} attempt
                        {profile.attempts.length === 1 ? "" : "s"} recorded
                        {profile.latestAttempt
                          ? ` · Latest ${new Date(
                              profile.latestAttempt.response.submittedAt,
                            ).toLocaleString()}`
                          : ""}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                      <div className="rounded-md bg-slate-100 px-3 py-2">
                        <p className="text-slate-500">Avg accuracy</p>
                        <p className="font-bold">
                          {formatPercent(profile.averageAccuracy)}
                        </p>
                      </div>
                      <div className="rounded-md bg-slate-100 px-3 py-2">
                        <p className="text-slate-500">Avg confidence</p>
                        <p className="font-bold">
                          {profile.averageConfidence.toFixed(1)}/4
                        </p>
                      </div>
                      <div className="rounded-md bg-slate-100 px-3 py-2">
                        <p className="text-slate-500">Priority</p>
                        <p className="font-bold">{profile.priorityCount}</p>
                      </div>
                      <div className="rounded-md bg-slate-100 px-3 py-2">
                        <p className="text-slate-500">Task signals</p>
                        <p className="font-bold">{profile.taskSignalCount}</p>
                      </div>
                    </div>
                  </div>

                  {profile.latestAttempt ? (
                    <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-md bg-slate-50 p-4">
                      <h3 className="font-semibold">Latest observed data</h3>
                      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-slate-500">Accuracy</dt>
                          <dd className="font-semibold">
                            {getAccuracyLabel(profile.latestAttempt)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Difficulty</dt>
                          <dd className="font-semibold">
                            {profile.latestAttempt.response.perceivedDifficulty ??
                              "not captured"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Reading time</dt>
                          <dd className="font-semibold">
                            {profile.latestAttempt.response.readingTimeSeconds ?? 0}s
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Total time</dt>
                          <dd className="font-semibold">
                            {profile.latestAttempt.response.timeOnTaskSeconds}s
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Hints opened</dt>
                          <dd className="font-semibold">
                            {getTotalHints(latestQuestions)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Passage revisits</dt>
                          <dd className="font-semibold">
                            {getTotalPassageRevisits(latestQuestions)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Answer changes</dt>
                          <dd className="font-semibold">
                            {getTotalAnswerChanges(latestQuestions)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">First-answer delay</dt>
                          <dd className="font-semibold">
                            {Math.round(getAverageFirstInteraction(latestQuestions))}s avg
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="rounded-md bg-emerald-50 p-4">
                      <h3 className="font-semibold">Latest recommendation</h3>
                      <p className="mt-2 text-lg font-bold">
                        {profile.latestAttempt.recommendation.summary}
                      </p>
                      <p className="mt-2 leading-7 text-slate-700">
                        {profile.latestAttempt.recommendation.action}
                      </p>
                      {profile.latestAttempt.response.reflectionComment ? (
                        <div className="mt-4 rounded-md bg-white p-3 text-sm leading-6 text-slate-700">
                          <p className="font-semibold text-slate-900">
                            Learner reflection
                          </p>
                          <p>{profile.latestAttempt.response.reflectionComment}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  ) : (
                    <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
                      <h3 className="font-semibold">No attempts yet</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        This student is on the class roster, but has not completed
                        the activity yet.
                      </p>
                    </div>
                  )}

                  {profile.attempts.length > 0 ? (
                    <div className="mt-5">
                    <h3 className="font-semibold">Attempt history</h3>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="py-2 pr-3 font-semibold">Attempt</th>
                            <th className="py-2 pr-3 font-semibold">Date</th>
                            <th className="py-2 pr-3 font-semibold">Accuracy</th>
                            <th className="py-2 pr-3 font-semibold">Confidence</th>
                            <th className="py-2 pr-3 font-semibold">Difficulty</th>
                            <th className="py-2 pr-3 font-semibold">Hints</th>
                            <th className="py-2 pr-3 font-semibold">Revisits</th>
                            <th className="py-2 pr-3 font-semibold">Recommendation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profile.attempts.map((attempt, attemptIndex) => {
                            const attemptQuestions = getQuestionResponses(attempt);

                            return (
                              <tr
                                key={attempt.response.id}
                                className="border-b border-slate-100"
                              >
                                <td className="py-3 pr-3 font-semibold">
                                  {profile.attempts.length - attemptIndex}
                                </td>
                                <td className="py-3 pr-3">
                                  {new Date(
                                    attempt.response.submittedAt,
                                  ).toLocaleDateString()}
                                </td>
                                <td className="py-3 pr-3">
                                  {getAccuracyLabel(attempt)}
                                </td>
                                <td className="py-3 pr-3">
                                  {getAverageConfidence(attemptQuestions).toFixed(1)}/4
                                </td>
                                <td className="py-3 pr-3">
                                  {attempt.response.perceivedDifficulty ??
                                    "not captured"}
                                </td>
                                <td className="py-3 pr-3">
                                  {getTotalHints(attemptQuestions)}
                                </td>
                                <td className="py-3 pr-3">
                                  {getTotalPassageRevisits(attemptQuestions)}
                                </td>
                                <td className="py-3 pr-3">
                                  {attempt.recommendation.summary}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  ) : null}

                  {profile.latestAttempt ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {profile.latestAttempt.recommendation.indicators.map(
                        (indicator) => (
                          <span
                            key={indicator.id}
                            className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                              severityStyles[indicator.severity]
                            }`}
                            title={indicator.evidence}
                          >
                            {indicator.label}
                          </span>
                        ),
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
