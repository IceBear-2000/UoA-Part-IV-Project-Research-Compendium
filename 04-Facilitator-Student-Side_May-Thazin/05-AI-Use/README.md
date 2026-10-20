# 05 · AI Use

A record of what AI tools were used for in Part 2.

## Tools

| Tool | Used for |
|---|---|
| Claude (Anthropic) | Research support, code, evaluation, figures, poster drafting, report drafting and formatting, repository tidy-up |

## What AI was used for

### Research

- Finding lists of relevant resources and literature to read
- Organising references and formatting them in IEEE style
- Flagging statements that needed a citation, marked `[REF]` for a source to be found and checked

### Code and evaluation

- Fixing the app build: adding the missing `lucide-react` dependency, connecting the rules v2 engine to the dashboard and the CSV export, and passing earlier sessions into the comprehension-pattern check
- Extending `simulated_classroom_evaluation_v2.py`: moving the timing-neutral check from a scratch file into the main script, and adding 95% bootstrap intervals, sensitivity runs, seed replication and `poster_numbers.csv`
- Pinning the Python dependencies in `requirements.txt`
- Adding demo learners to the dashboard, and a script to capture the Figure 3.2 screenshot (later removed from the repository)
- Changing the figure script to read from the result CSVs instead of hard-coded values
- Computing the per-reader-type table `results_v2/table_flagged_by_reader_type_timing_neutral.csv` (see [`04-Evaluation`](../04-Evaluation/#reproducibility-check))

### Display Day poster

- Explaining the results, including relabelling the Random Forest trained on true labels as an "answer-key model": a ceiling, not a usable tool
- Drafting poster text, chart data and charts, a colour palette and the reference list

### Final report

- Drafting sections from the result files: research sub-questions, abstract, methodology, results, discussion, conclusions and future work, literature review sections 2.7 and 2.8, the requirements table, the glossary, and templates for the statement of contribution and acknowledgements
- Reframing the contribution around the rules, because the results showed that a Random Forest trained on rule labels only copies the rules
- Aligning the report's headline figures with the poster (timing-neutral run)
- Building the Word document in the ECSE template with numbered references, cropping figures, and checking the page and word limits

### Repository and compendium

- Removing leftover comments and unused poster files, and writing the README files
- Writing step-by-step instructions for the branch and pull request
- Testing a fresh clone of the repository (build, lint, evaluation rerun)
- Drafting the Part 2 compendium pages and rerunning the evaluation to check reproducibility

## Checks on AI-assisted work

| What | Check |
|---|---|
| Numbers in the report and poster | Taken from the result CSVs. The evaluation reruns from fixed seeds and reproduces the committed tables (checked on 19 and 20 October 2026) |
| Rules in the app and in the evaluation | Same metric names and thresholds in TypeScript and Python; the Learner A walkthrough (Report Section 4.7) traced through the real engine |
| App | Type check, lint and production build; a full student session run in the browser; demo learners checked on the dashboard |
| References | No references were generated without a source; missing citations were marked `[REF]` and filled from the literature |
