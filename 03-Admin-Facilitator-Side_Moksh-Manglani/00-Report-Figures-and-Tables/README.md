# 00 · Report Figures and Tables

Every figure and table in Moksh's final report, taken from the submitted document, with a pointer to the evidence or source data behind it. Figures are in [`figures/`](figures/) as images. Tables are in [`tables/`](tables/) as CSV, so the data can be opened in a spreadsheet or re-plotted.

## Figures

| File | Report caption | Source and evidence |
|---|---|---|
| [`figure-01.png`](figures/figure-01.png) | **Figure 1.** Early system concept used to set the scope of the platform | The scope in [`02-General/Project-Document`](../../02-General/Project-Document/) |
| [`figure-02.png`](figures/figure-02.png) | **Figure 2.** The research approach. Each stage is described in the sections that follow | Report Chapter 4 |
| [`figure-03.png`](figures/figure-03.png) | **Figure 3.** How the platform was designed and built: specification first, then short build sessions, each tested before the next | The specifications in [`06-AI-Use/for-code`](../06-AI-Use/for-code/) |
| [`figure-04.png`](figures/figure-04.png) | **Figure 4.** The five steps of using the platform. Admins build and approve, and facilitators request, walk through and deliver. The chat connects facilitators to admins during the walkthrough and delivery | [`03-Design`](../03-Design/) |
| [`figure-05.png`](figures/figure-05.png) | **Figure 5.** System architecture. Requests pass through middleware to Server Components and Server Actions, which use Supabase; Server Actions also call Resend and the Claude API | [`03-Design`](../03-Design/), `middleware.ts` and `app/` in [`04-Code`](../04-Code/) |
| [`figure-06.png`](figures/figure-06.png) | **Figure 6.** The data model: eleven models, with access and progress records tied to users | `prisma/schema.prisma` in [`04-Code`](../04-Code/) |
| [`figure-07.png`](figures/figure-07.png) | **Figure 7.** The lesson authoring page (a) and the block picker (b) | Screenshot of the live platform |
| [`figure-08.png`](figures/figure-08.png) | **Figure 8.** The Classes page in (a) list view and (b) card view | Screenshot of the live platform |
| [`figure-09.png`](figures/figure-09.png) | **Figure 9.** The lesson player (a) when first opened and (b) after every block is finished | Screenshot of the live platform; rules tested in [`05-Evaluation`](../05-Evaluation/) section B |
| [`figure-10.png`](figures/figure-10.png) | **Figure 10.** The worksheet generator: (a) reviewing the AI's summary; (b) editing, regenerating or adding the worksheet | [`06-AI-Use/for-code`](../06-AI-Use/for-code/) (specification); [`05-Evaluation`](../05-Evaluation/) section D |
| [`figure-11.png`](figures/figure-11.png) | **Figure 11.** The tools and pipeline used to go from an idea to a tested build | [`06-AI-Use`](../06-AI-Use/) |

## Tables

| File | Report caption | Source data |
|---|---|---|
| [`table-1.csv`](tables/table-1.csv) | **Table 1.** The two sides of the project | Meeting minutes, 12 May |
| [`table-2.csv`](tables/table-2.csv) | **Table 2.** Existing models of education compared against the six criteria | [`01-Research`](../01-Research/); the April literature review in [`01-Submissions/01-Scope-and-Literature-Review`](../../01-Submissions/01-Scope-and-Literature-Review/) |
| [`table-3.csv`](tables/table-3.csv) | **Table 3.** Sub-questions, how each is answered, and where it is reported | Report Chapter 4 |
| [`table-4.csv`](tables/table-4.csv) | **Table 4.** Existing platforms and StudyBuddy rated against the six criteria | [`01-Research`](../01-Research/) |
| [`table-5.csv`](tables/table-5.csv) | **Table 5.** Examples from the second heuristic review | [`05-Evaluation/EVALUATION_RESULTS.md`](../05-Evaluation/EVALUATION_RESULTS.md), section E1 |
| [`table-6.csv`](tables/table-6.csv) | **Table 6.** Access and security checks | `raw/a1-access.json`, `raw/a2-auth.json`, `raw/a11-schema.json` in [`05-Evaluation`](../05-Evaluation/) |
| [`table-7.csv`](tables/table-7.csv) | **Table 7.** Lesson-flow rules on a five-block lesson | `raw/b-flow.json` in [`05-Evaluation`](../05-Evaluation/) |
| [`table-8.csv`](tables/table-8.csv) | **Table 8.** Tools tried for each job and what was kept in the pipeline | [`06-AI-Use`](../06-AI-Use/) |
| [`table-a1.csv`](tables/table-a1.csv) | **Table A1.** Nielsen's ten heuristics and how StudyBuddy responds to each | `nielsen-heuristics-review.html` in [`06-AI-Use/for-evaluation`](../06-AI-Use/for-evaluation/) |
| [`table-a2.csv`](tables/table-a2.csv) | **Table A2.** Response times on a local production build (25 runs each, in milliseconds) | `raw/c-perf-local.json` in [`05-Evaluation`](../05-Evaluation/) |
| [`table-a3.csv`](tables/table-a3.csv) | **Table A3.** Worksheet generator test set | `raw/d-results.json`, `raw/d6-perf.json`, `raw/anthropic-usage.jsonl` in [`05-Evaluation`](../05-Evaluation/) |
