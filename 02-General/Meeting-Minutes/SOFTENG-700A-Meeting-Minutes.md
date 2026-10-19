# SOFTENG 700A/B: Meeting Minutes

Minutes of every supervisor and team meeting from 13 April to 14 October 2026, kept in a shared Google Doc during the project and exported here on 19 October 2026.

**Editing note.** The minutes are reproduced as recorded, with these changes only: formatting and note-taking shorthand were tidied for readability without changing the meaning, video-call and design-tool links were removed, a misspelling of Moksh's surname was corrected, one date copied from the template by mistake was corrected (6 May), and two lines in the 5 August entry that identified prospective interviewees personally were replaced with their roles. Meetings with no notes recorded are kept, so the record of meetings is complete.

**Attendees:** Professor Gill Dobbie (supervisor), May Thazin, Moksh Manglani.

---

## Contents

| Date | Who | Main topics |
|---|---|---|
| [Mon 13 April](#mon-13-april-2026) | Gill, May, Moksh | Literature review criteria table, personas, scope, evaluation |
| [Wed 6 May](#wed-6-may-2026) | Gill, May, Moksh (online) | Ethical use of AI, homeschooling focus, risks |
| [Mon 11 May](#mon-11-may-2026) | Gill, May, Moksh | Pivot from student-behaviour analysis to supporting facilitators |
| [Tue 12 May](#tue-12-may-2026) | May, Moksh | Work split between the two parts |
| [Wed 20 May](#wed-20-may-2026) | Gill, May, Moksh | Interviews and ethics approval; May's research question |
| [Mon 25 May](#mon-25-may-2026) | Gill, May, Moksh | Interview plan, thematic analysis, MVP while waiting for ethics |
| [Tue 9 June](#tue-9-june-2026) | Gill, May, Moksh | Purpose of mock-ups; do not let ethics hold the work up |
| [Wed 17 June](#wed-17-june-2026) | Gill, May, Moksh | First mock-ups of both systems |
| [Tue 23 June](#tue-23-june-2026) | | No notes recorded |
| [Tue 7 July](#tue-7-july-2026) | Gill, May, Moksh | May's MVP demo; Moksh's database and schema |
| [Tue 14 July](#tue-14-july-2026) | May, Moksh | Live platform walkthrough; ML pipeline plan |
| [Wed 22 July](#wed-22-july-2026) | May, Moksh | Conference presentation plan |
| [Fri 24 July](#fri-24-july-2026) | Gill, May, Moksh | Conference run-through and feedback |
| [Tue 28 July](#tue-28-july-2026) | Gill, May | Conference feedback: evaluation and the facilitator argument |
| [Wed 5 August](#wed-5-august-2026) | Gill, May, Moksh | Interview plan; "training" facilitators; May's benchmark |
| [Tue 25 August](#tue-25-august-2026) | Gill, May | Finalise findings over the break |
| [Tue 15 September](#tue-15-september-2026) | Gill, May, Moksh | Ethics pivot to informal chats; elevator pitch |
| [Mon 21 September](#mon-21-september-2026) | Gill, May, Moksh | Meeting time change; poster planning |
| [Wed 7 October](#wed-7-october-2026) | Gill, May, Moksh | Poster content and future work |
| [Wed 14 October](#wed-14-october-2026) | May, Moksh | Conclusions |

---

## Mon 13 April 2026

**Time:** 3:00pm to 4:00pm
**Attendees:** Moksh Manglani, May Thazin, Gill Dobbie
**Absentees:** None

**Discussion**

- Literature review (table with criteria)
- Design for user needs (personas), leading to target users
- System limitations, and why it does what it does
- Clean up the requirements and purpose
- Select evaluations for success
- System mock-ups (Figma, diagrams, networks, etc.)
- Select scope and functionality while building
- Presentation for next week's meeting: have a proper presentation
- Write down design decisions and choices

---

## Wed 6 May 2026

**Time:** 3:00pm to 4:00pm
**Attendees:** Moksh Manglani, May Thazin, Gill Dobbie
**Absentees:** Moksh Manglani, sick, emailed at 7:00am (attended online)

**Discussion**

- How AI should be integrated into the system ethically (focusing on Gill's expertise)
- Purpose: make education easier to deliver and access, creating a complementary tool to facilitate interactions between students and teachers (homeschooling organisation)
- Aim for one group, the **homeschooling community**, and the Ministry of Education
  - Engage and survey about AI (recommend one or two people)
  - After the prototype, help to evaluate whether the system would work in theory
- AI could be the facilitator: measuring concentration, producing content based on levels
  - Body language, actions of students and interactions with the tool
  - Focusing on teacher load, personalised for each student's behaviours
  - Personalised report for each student (engagement levels, which study methods work best); AI can be more thorough and less biased
- Risks: criticism likely over laptop cost in low-income areas, privacy, security
  - Student over-reliance, students are still developing, extra screen-time risk
  - Could lose creativity
  - Ethical risks: parental consent (up to 16), learning disabilities, only indicators
- Anomaly detection
  - Flag when behaviour is different; explainability
- Using LLMs for grading and critiquing
- Ground-truth test
- Paul Denny wrote a paper on Year 1 computer science (an LLM on an exam)
  - Facilitator oversees the class
- Using one LLM to check another LLM
  - Run in key places, such as marking (to combat AI hallucinations)
- AI biases: future work
- Evaluating the system

---

## Mon 11 May 2026

**Attendees:** Moksh, Gill, May
**Absentees:** None

**Discussion**

- Wireframes and guidelines for the project
- **Pivot** from analysing student behaviour to using the feature to support facilitators (with less experience) to teach effectively and issue more effective content to students
- Presentation with user stories and a redefinition of the project purpose
- Homeschooling in New Zealand (HSNZ): a paid curriculum; the existing system sends the parent the curriculum, and the parent uses it to teach
  - Some similarities with our project; the difference is **delivery**
- Feedback on user stories:
  - Find a good way to separate the work: content quality and learning content, versus administration and platform building
- Functionality of the app, similar to Canvas and Moodle
  - Terminology
- Metrics for Year 1 versus Year 6
  - Assessment based on a student's own performance (improvement)
  - More general: having a student baseline
- Grading by AI, uploaded with photos
- Think outside the box
- Active monitoring, with data sent to the facilitator
  - Scope: fixing the shortage of teachers
  - Stakeholders: administrator and facilitator needs
- Research into evaluations
- Find a way to split up the work evenly

**Action items**

- Have a separation of responsibilities
- Have a solid plan and project structure

---

## Tue 12 May 2026

**Attendees:** Moksh, May
**Absentees:** None

**Discussion**

- Stepping back from the solution to analyse the problem properly
- **Moksh:** system architecture
  - Requirements elicitation
  - Conducting interviews to gather insights
  - Research into current initiatives in education
  - Pre-lesson facilitator
- **May:** facilitator research and AI use (psychological side): facilitator-based learning
  - Main problem: shortage of qualified teachers and inconsistent education quality in lower-income rural areas, plus different curriculum interpretations (K-12, primary)
  - Refer to the literature review for topics and areas to focus on (problems)
  - Analysing current education systems, and how to adapt them for facilitators
  - Blended learning: K-12 effectiveness considerations
  - Gap with Hindi-speaking teachers teaching English (enabling teachers to teach areas they are not confident in)

---

## Wed 20 May 2026

**Time:** 3:00pm to 4:00pm
**Attendees:** May, Moksh, Gill
**Absentees:** None

**Discussion**

**May**

- Problem with limiting to low-resource settings
- Solving how to gather the information the LLM needs
  - We can make an acceptable assumption that students will have access to devices
- Levels of students (demonstrate with case studies at different levels)
  - Causal reasoning for Year 3: research more into how
- Limit scope to be less about education and more about the analysis and software side
- "Design and evaluate a system that analyses learner interactions and generates facilitator-support insights."
- "How do we realistically collect meaningful learner interaction data to support AI-assisted classroom insights?"

**Moksh**

- Planning interviews with students and teachers for requirements elicitation
- Academic coordinator and teacher
- Two-section approach: current functions, and a daily walkthrough
- Feedback from Gill:
  - Ask the same set of questions (systematic)
  - Ethics approval takes about three months
  - Start from the beginning: what information do you want, and why?
  - Approach it scientifically
  - Interviews and ethics at the University of Auckland
  - Good for the final presentation: you will be asked what you have done
  - Be careful with ethics approval; do not disrupt people's lives
  - Make sure it is a formal interview
  - Read about ethics beforehand
- Plan to present the questions at the next meeting for requirements elicitation

**General**

- Get the prototype done in the semester break
- Follow-up interviews after the prototype is developed

**Action items**

- **May:** propose a solution for accessibility and for how to collect data to feed to ML for student analysis; lay out data collection and the ethics associated with it
- **Moksh:** have a proper interview document with well laid-out questions; research interview ethics and review the official UoA process

---

## Mon 25 May 2026

**Time:** 2:00pm to 3:00pm
**Attendees:** Moksh, May, Gill

**Discussion**

- Decide on the balance between a formal interview and progress on the project
- Two weeks for interviews (plan according to the Gantt chart)
- Ethics approval (look at what to submit, such as the participant information sheet)
  - Make sure it is thorough and professional
- Create an MVP while waiting for interview approval
- How long will interviewees take to answer? About 15 minutes (more for in-person interviews)
- Goals of the survey:
  - Validate the approach
  - Understand pain points in the current system
  - Find facilitators' needs
- How to find an entrepreneur: use connections
- Ran through the interview questions (in the interview planning document)
- How would we use the results?
  - A methodical way of reviewing
  - Using scales and statistics (easier for reporting)
  - Thematic analysis
  - Explain the methodology; research needs to be repeatable
- Prompt engineering (for facilitators to search student data and feedback)
- Guidance for facilitators (a methodology for them to follow)
- A process for facilitators to understand students and use the tools effectively
  - Criteria for students: assess against a set standard (NZ, India, Europe, etc.)
- Student reviews: facilitators can ask about students
- Classroom review (general): a metric to assess the effectiveness of teaching

**Action items**

- Complete the interview questions
- Research collation
- Create prototypes for a proof of concept
  - System architecture: Moksh
  - Assessment prototype: May

---

## Tue 9 June 2026

**Time:** 10:00am to 11:00am
**Attendees:** May, Moksh, Gill

**Discussion**

- Have a purpose for the UI mock-ups and the evaluation
- Ethics approval (potentially ask for more information)
  - Do not let it hold you up (do a mock interview)

**Action items**

- **May:** start the prototype; design diagram with constraints
- **Moksh:** try a mock interview, and UI mock-ups

---

## Wed 17 June 2026

**Time:** 3:00pm to 4:00pm
**Attendees:** Gill, Moksh, May
**Absentees:** None

**Discussion**

- **May**
  - Has created the system design, with a clear scope and goals
  - Time of day varies from day to day
    - A 5 to 10 minute assessment every day before the lesson (allows trends, and a baseline for each student rather than weekly)
  - Facilitator side: a decision-support system
  - Reading comprehension (look into research): how to assess it effectively?
  - Think about which research questions are being answered, and how
  - Create criteria
- **Moksh**
  - Has created mock-ups for the facilitator and admin system (StudyBuddy)
  - Only the admin can create lessons
  - The admin should get alerts if facilitators are not doing their work
  - Useful to have personas when explaining the project to other people

**Action items**

- **May:** create proper mock-ups and start building the system
- **Moksh:** more admin and facilitator considerations in the design; facilitator progress and material quality; administrator monitoring

**Moksh's items**

- Facilitator and admin alerts, and notifications
- More statistics for the admin
- A report produced from notifications to highlight common issues (for example, if all facilitators had a problem with Lesson 1, Question 2, we need to be able to track and monitor it)
- Look into more information and features about metrics that admins would benefit from
- Do mock interviews
- Make user personas to explain ideas

---

## Tue 23 June 2026

**Time:** 10:00am to 11:00am

No notes recorded.

---

## Tue 7 July 2026

**Time:** 10:30am to 11:00am
**Attendees:** Moksh, May, Gill Dobbie
**Absentees:** None

**Discussion**

- **May**
  - Completed the MVP for the student side; did a walkthrough demo
  - For facilitator decision-making: a rule-based system (to make actionable decisions)
  - Classroom versus individual analysis
    - Classroom analysis for the overview, and to see common mistakes the teacher can take on board or focus on
    - Individual analysis for student profiles
  - Look into more educational papers to back up the design and educational aspects (such as what actions facilitators should take for comprehension)
- **Moksh**
  - Completed the database section; planning to work on authentication and security next
  - Walked through the coding process
  - Discussed how the schema is organised (the schema is essentially determined by how people access data)
  - Think about the project process for the report (evaluation and validation)
- Everything in our papers should be reproducible

**Action items**

- **May:** complete the AI and ML layer; research the facilitator side for decision-making and eye tracking; work on the mid-year report and conference

---

## Tue 14 July 2026

**Time:** 10:00am to 10:30am
**Attendees:** Moksh, May

**Discussion**

- **May**
  - Machine learning pipeline plan
  - Defined five dimensions for the AI to classify, based on the data from the assessment
  - Potential models (decision tree, random forest, XGBoost)
    - A classification task (based on the five dimensions, expandable)
  - Ensure there are individual and class summaries for the facilitator
  - Decide what the feedback for the facilitator would be (research based)
- **Moksh**
  - Walkthrough of the admin and facilitator sides on the live platform (<https://study-buddy-uoa-project.vercel.app>)
  - Lesson walkthrough on the facilitator side
  - Lesson creation on the admin side
  - Showing the flows and functionality of the web application
  - No student interface
  - Other major functionality to implement:
    - AI worksheet generation (planned with an LLM and prompt engineering)
      - Refinement loop (filtering through multiple prompts)
      - Checking with the admin before publishing, plus a manual editor
      - A counter for token usage and cost
    - A tutorial feature for new facilitators
  - Need formal lessons (small and authentic: quality over quantity)
    - Use the NCERT curriculum or another formal curriculum
  - For presentations, show the motivation and why (low-resource communities in India)
- Presentations: motivation, research, question, results

---

## Wed 22 July 2026

**Time:** 11:00am
**Attendees:** Moksh, May
**Absentees:** None

**Discussion**

- Conference presentation (Project #133)
- Conference at 12:30 in room 405-236
- Plan: Moksh presents first, then May
- Moksh introduces the main problem (with brief mentions of May's part), then goes into the system design
- Hand over to May to go into her sub-problem, her system design and the application she built

**Action items**

- Complete our sections of the conference presentation

---

## Fri 24 July 2026

**Time:** 10:00am to 11:00am
**Attendees:** May, Moksh, Gill Dobbie
**Absentees:** None

**Discussion**

- Presentation run-through and feedback
- **Moksh**
  - Introduce that we have facilitators to deliver content, despite inexperience
  - Good job splitting the problem
- **May**
  - Research question: make it more specific (quantify it)
    - Focus on technology and AI (focus on software engineering)
  - Motivation and research gap (include sources for claims)
  - Research approach (framework pipeline, building a proof of concept), based on the literature
  - Proof of concept (explain the screenshots)
  - Contributions and future work: future contributions for me, future work for others
- **Overall**
  - Expect questions about related systems and how ours differ from existing systems
  - If asked about privacy, describe the choice to opt out (show the thinking behind it)
  - Backup slides on: technology stacks; the software engineering pipeline (iterative); design decisions; the literature review and sources; evaluation and testing (technical, software); usefulness of the system and how it helps learners
  - People will wonder why it is needed: explain the differences (could be expanded)
    - Understanding how people are learning (beyond examining students with assessments)
    - Not evaluating students, just supporting learning
- **Mid-year technical report**
  - Description of the system and the technologies used
  - The design process and the decisions made

---

## Tue 28 July 2026

**Time:** 10:00am to 10:30am
**Attendees:** May, Gill Dobbie
**Absentees:** Moksh

**Discussion**

- Went over the conference presentation feedback
- Industry people will walk around and observe from an industry point of view
  - Identify what is new from a technical perspective
- **The argument for having non-teachers deliver lessons**
- Evaluating the system against separate criteria
  - Testing the system against another system or criteria
- Focus on evaluation in response to the feedback
  - Choose exactly what to evaluate
  - Choose both software and teaching evaluation
  - Benchmark the proof of concept against existing systems
- For the final project, put emphasis on the literature review
  - Emphasise the gaps in the area

**Action items**

- Evaluation, and the literature review

---

## Wed 5 August 2026

**Time:** 9:00am to 9:30am
**Attendees:** May, Moksh, Gill
**Absentees:** None

**Discussion**

- Gill away for two weeks (back on 24 August), then away from 1 September (back on 14 September)
- **Moksh**
  - Explain the concept better: **training** facilitators instead of supporting facilitators
  - Checklist of to-dos for the next two weeks
    - Planning interviews, an elevator pitch, and refining the system
    - Refine the system systematically
    - Aiming for 10 interviews: academic coordinators (2 to 3), teachers currently teaching (3), facilitators (3), students (2), which can be shifted around
    - Interview a school founder: good overview, and ideas for how the system will work
    - Interview a school academic head: the academic side of the system
  - Use the interviews as specific feedback (an overview is hard to do): gives background and design decisions (taking quotes from them)
    - Lean towards not using statistics (not very strong)
  - Qualitative analysis methods: how to distil themes
    - Check the process for handling interview information (LLM standard)
  - Document them, and look at the literature for the literature review (to provide context and back it up)
- **May**
  - "What value does lightweight learner-interaction data add beyond assessment outcomes, and how reliably can it be transformed into explainable decision-support indicators?"
  - Using Kami as a benchmark; potentially reach out for more information
    - The system started off as a PDF editor
    - Comparing features
    - Two Part IV students spoke to the development team and got quotes about the need for such a system
    - Functional analysis
  - A baseline for students: A, B and C students (percentages)
    - Create some data, with justification
  - Made this a classification problem; aim to use Random Forest (easy, and explainable)
    - Comparison between the rule-based model and ML

---

## Tue 25 August 2026

**Time:** 10:30am to 11:00am
**Attendees:** Gill Dobbie, May

**Action items**

- Finalise the report and findings during the mid-semester break
- Next meeting on 15 September

---

## Tue 15 September 2026

**Time:** 10:00am to 11:00am
**Attendees:** May, Moksh, Gill
**Absentees:** None

**Discussion**

- **Moksh**
  - Presented a summary of the work done
  - Elevator pitch for Display Day
    - Should be able to say what the platform is about, and how it helps
    - Nail down the points and the phrasing
  - Ethics approval progress: **shift to informal chats** and gather information that way
  - Design decision documentation
  - How will you write about the informal reviews in the report?
    - Make the chats read as credible and with merit (professional, including each person's relevant experience and why they were chosen)
  - People need to know what your contribution is
  - Do an informal thematic analysis of the chats
- **May**
  - Walkthrough of current progress and plan
- **Poster display**
  - A 10-minute elevator pitch (interactive elements and a demonstration will help)

---

## Mon 21 September 2026

**Time:** 10:00am to 11:00am
**Attendees:** Moksh, May, Gill Dobbie
**Absentees:** None

**Discussion**

- **General**
  - Clarified the Tuesday and Wednesday meetings
  - Recurring meetings move to **Wednesday 9:00am to 9:30am**
  - Next week is Systems Week; send updates if unavailable
  - Design decisions do NOT go on the poster; keep a logical flow
  - The technical parts depend on the story of the project
  - Work out how much detail the poster needs
- **May**
  - Continuing to develop the tool
  - Creating visuals of the student cards for the poster

---

## Wed 7 October 2026

**Time:** 9:00am to about 10:00am
**Attendees:** Gill, May, Moksh
**Absentees:** None

**Discussion**

- The poster should show the technical side of the project
  - What have you done? What are the findings and results?
- Work out what is important to show what you have done and why it matters
- Prioritise what NEEDS to be on the poster
- Future work:
  - Integrate the two systems to give **personalised** learning based on learner insight data
- Make everything more concise and readable
- Nice visuals and a story; any information not used goes into the demo
- A lesson walkthrough on the poster for interactivity

**Action items**

- Display poster done: send the poster by Friday (Sunday morning at the latest); due at midnight
- Final report draft

---

## Wed 14 October 2026

**Time:** 9:00am to about 10:00am
**Attendees:** May, Moksh
**Absentees:** None

**Discussion**

- Have a solid conclusion: not a replacement, but a tool to help flag students; a proof of concept
