# Facilitator decision-support tool

Proof-of-concept tool for Part IV Project #133. Learners in Years 3–6 complete a
short reading check (one passage, two literal and two inferential questions,
and a self-reported confidence judgement after each answer). Evidence-linked
rules turn their answers and interaction signals into a status for the
facilitator ("Needs support", "Worth a check-in" or "On track"), shown with the
evidence behind it and a suggested next step.

## Run the app

Requires Node.js.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose the student
activity or the facilitator dashboard. On the dashboard, "Load demo data" adds
seven anonymous demo learners. Data is stored in the browser's local storage and
can be exported as CSV.

## Project structure

```
src/
├── app/                      Next.js routes: home, /student, /facilitator
├── features/
│   ├── analytics/            recommendationEngine.ts: session metrics, rules v2, class patterns
│   ├── facilitator/          dashboard and demo data
│   └── student/              reading activity and passage content
└── shared/
    ├── export/               CSV export (same columns as the evaluation)
    ├── storage/              local-storage persistence for results and roster
    └── types/                shared data types
evaluation/                      simulated classroom evaluation (see evaluation/README.md)
```

## Evaluation

The rules are evaluated on simulated classrooms in Python. The rules in
`recommendationEngine.ts` mirror `rules_v2()` in
`evaluation/simulated_classroom_evaluation_v2.py`. See
[evaluation/README.md](evaluation/README.md) for how to reproduce the results.
