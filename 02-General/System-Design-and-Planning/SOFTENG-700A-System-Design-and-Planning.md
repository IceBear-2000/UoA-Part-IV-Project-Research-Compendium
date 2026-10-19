# SOFTENG 700A: System Design and Planning

> **What this is.** The joint planning document from April to May 2026 that mapped the gaps found in the literature reviews to candidate features. Tab 1 is the shared feature map (the origin of the platform's four core components). Tab 2 is May's early exploration of learner analysis, which became Part 2 of the project. The document's own heading says these were rough ideas, not final decisions.
>
> Exported from Google Docs to Markdown on 19 October 2026 and lightly reformatted for readability. The content is unchanged.

---

## Tab 1

**Features based on gaps in the literature review.** *Note: only rough ideas, not finalised.*

- **Personalisation and delivery gap** (AI can personalise content but not delivery)
  - Structured Lesson Flow Engine
  - AI Content Generator (controlled)
  - Lesson Templates
- **Teacher dependency and scalability gap** (education depends on expert teachers)
  - Facilitator Dashboard
  - Instructional Prompts
  - Pre-built Lesson Packs
- **Lack of structured guidance** (students cannot self-direct effectively)
  - Guided Lesson Mode
  - Progress Tracking
  - Time-Based Pacing
- **Accessibility and equity gap** (we want anyone, anywhere, to be able to run a class)
  - Low Resource Mode
  - Facilitator-first design
- **Adaptability gap** (current systems do not adapt across contexts)
  - Modular Lesson System
  - Grade-level configuration
  - Organisation-level customisation

**Core system components (based on the initial plan):**

1. **Core Learning Delivery System**, containing the facilitator dashboard
2. **Content and Lesson Authoring System**, containing the admin interface
3. **AI Support Layer**, containing the AI features
4. **Platform Infrastructure**, containing content security, multi-tenant architecture and scalability features

---

## Tab 2

Reference: <https://homeschoolingnz.org/curriculum-qualifications/>

I want to build more onto the idea of helping to analyse students' behaviours. After discussing with a person in the educational field, they suggested that this tool be used to help analyse learning styles for different ages, as the learning styles and capabilities are vastly different in the K-12 range. We could use this as a preliminary assessment before classes start so the teacher or facilitator can work with what the child works with best (for example a Year 1 to 2 preliminary learning style assessment, Year 3 to 4, Year 5 to 6, Year 7 to 8, and so on).

**Core idea of the proposed feature:** using AI to help facilitators understand how students learn best before and during lessons.

- Connects to: reducing teacher load, student personalisation
- Potential system features: student profiling, engagement tracking, anomaly detection, facilitator suggestions

**Relation to project purpose:** to support facilitators in delivering more effective and personalised learning experiences by using AI to identify student learning behaviours, engagement patterns and preferred learning approaches.

**Measurements:**

- Behavioural engagement: time on task (s), activity completion (%), participation frequency (%), interaction count (no.), response rate (%)
- Cognitive engagement: proxy indicators (retry attempts, hint usage, question depth, revision frequency)
- Self-regulated learning (SRL) indicators

**Existing solutions:** TeachLens (AI lesson observation), Vizenta AI (Class Engage AI), GIANTY (AI classroom analysis).

**Reframed purpose:**

- Exists to help non-expert facilitators adapt lessons for mixed-ability classrooms where formal educational support may be limited
- Helps to indicate how much support a student may need and what they would benefit from
- Helps with accessibility and supporting facilitators (helping facilitators prepare better for the class they are about to teach)

**Supporting sources (for the literature review):**

English, A. (2021). Assessing the role of exposure to learning styles theory on K-12 teachers. *Teacher Education Quarterly, 48*(4), 78–96. <https://www.jstor.org/stable/27099523>
