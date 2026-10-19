# UoA Part IV Project Document

> **What this is.** The shared working document both students used from March to April 2026 to define the project: the brief, the scope, the feature tiers, the gap analysis and the early literature notes. It is an early planning record, so some ideas in it (for example the commercial "Uber for schools" framing and the multi-tenant marketplace) were later dropped or narrowed; see [`../Project-Timeline.md`](../Project-Timeline.md) for how the scope changed.
>
> Exported from Google Docs to Markdown on 19 October 2026. Wording is unchanged except that the name of the partner school group has been removed, long dashes were replaced with hyphens, and emoji that did not survive the export were removed.

---

# Project Breif  

**Goals-****  
**We aim to create a facilitator based education platform that aims to make education more accessible, affordable and consistent.

We aim to leverage AI in innovative ways to enhance the quality of education, make classes more engaging, interactive and to make it very resource friendly.

This platform will also make it extremely easy for people to setup their own educational institution and provide education while making an income.

This platform can also be thought of as Uber for People who want to start schools.

  
  

**Scope-****  
**FACILITATOR DASHBOARD:

Facilitator logs in  
Sees today's class schedule  
Clicks into a lesson

Enters a lesson to receive step-by-step guided flow

STEPS-

Video - embedded player, no download

✏️ Workbook - page reference, preview,   
📝 facilitator instructions  
Activity - classroom activity instructions  
Worksheet - AI-generated or pre-uploaded, printable

Marks lesson as complete

  

ADMIN PANEL (To be used By Us)

Coordinator logs in (authenticated, elevated role)  
Creates/organizes classes, subjects, lesson plans   
Uploads videos to the platform (has secure storage)  
Creates structured lesson flows using multiple step types  
Assigns lessons to facilitators  
Reviews and approves AI-generated worksheets

  

CONTENT SECURITY

Videos require authentication to access

No direct download links (signed/temporary URLs)

Role-based access  
(admin sees everything, facilitator sees only content)

  

ONE AI FEATURE 

AI Worksheet Generator

"Generate a worksheet for Nursery: Letter A recognition"

Facilitator can print it from the lesson flow

  

MULTI-TENANT ARCHITECTURE  
Data model structured around Organization entity  
A partner school group operates as the first organisation  
Architecture supports onboarding additional organizations without structural changes  
Foundation for future marketplace model

  
  
  

# User Personas  

  
  

  - Photo
  - Persona Name:
  - Role (with respect to the platform):
  - Age:
  - Occupation:
  - Location:
  - Lifestyle:

  

  - Primary Goal:
  - Secondary Goals:
  - Needs:
  - Barriers:

  
  

|  |  |
| :-: | :-: |
| \*\*Key Aspects of a Persona:\*\*  - Specific to a work role&#10;  - Not an actual user&#10;  - Concrete characteristics |   - Derived from user research&#10;  - Defined by user goals&#10;  - Guide design&#10;  - Specific and precise |
| \*\*Tips for Designing User Personas:\*\*  - Point to a direct one-to-one relation with an observed user behaviour (focus on key tasks)&#10;  - Make the persona 3-dimensional. As a real person&#10;  - It can be a synthesis observed over multiple users&#10;  - Pair a persona with a scenario (the goal, conditions, activities, outcomes) |  |

  
  

# To Do  

Look into other examples in training field, Like potentially people training   
Create videos for safety training, can be considered-  
  
someone who is NOT the expert delivers a session created BY experts, guided step-by-step by the platform. - ----------------------  
Put it all together,  
Put points→

  
  
  

# To consider  

Moodle Based application.

(trusted, good from a business point of view)  

# Tech-Stack  

TECHNOLOGY STACK:

     Frontend + Backend:  Next.js (TypeScript)

     Database + Auth:     Supabase (PostgreSQL)

     File Storage:        Supabase Storage

     AI Integration:      OpenAI / Claude API

     Deployment:          Vercel

     Version Control:     GitHub

  
  

# Success Criteria  

SUCCESS CRITERIA:

     □ Coordinator can create a multi-step lesson 

       (video + workbook + activity)

     □ Facilitator can execute a full lesson guided 

       entirely by the platform

     □ Video content inaccessible without authentication

     □ AI generates a printable worksheet from a 

       topic prompt

     □ Database architecture demonstrably supports 

       multiple organizations  

# Literature Review  

Literature Review - Research Topic / Questions

  

  - Teaching Standard → Content based (background)

  

**May**

  - How AI is currently used to teach + online schools (Covid impact)
      
      - What features to add
  - How our platform is different from self-learning (Home Schooling)  
     What are the pros and cons for self learning that pose a need for this platform

  
  

**Moksh**

  - How AI is currently used to teach 
      
      - What features to add
  - What are the shortcomings of modern teaching methods  
    \+ What works well in modern day teaching
  - How online schools are currently teaching
  - COVID- Teaching

  
  

|  |
| :-: |
| Self Learning / Home Schooling Pros and Cons  - \<https://www.sciencedirect.com/science/article/pii/S0957417408008555\>&#10;      &#10;      - Self regulating students and using E-learning tools&#10;      - Assess how self regulated learning is assisted with e-learning tools&#10;  - \<https://bera-journals.onlinelibrary.wiley.com/doi/10.1111/bjet.13454\>&#10;      &#10;      - Comparative study between students using rule bots for learning (Nemo Bot) and students using self regulated learning bots (ChatGPT AI) or learning&#10;  - \<https://www.scopus.com/pages/publications/105014474148?origin=resultslist\#tab=references\>&#10;      &#10;      - Useful for finding references (Literature Review)&#10;  - \<https://www.sciencedirect.com/science/article/pii/S0360131513002285?via%3Dihub\>&#10;      &#10;      - Leveraging personalised systems to improve SDL in online environments&#10;  - \[Education 4.0 and 5.0: integrating Artificial Intelligence (AI) for personalized and adaptive learning \](https://www.reseaprojournals.com/journals/ai-robotics/archive/education-40-and-50-integrating-arti-cial-intelligence-ai-for-personalized-and-adaptive-learning)→ (Downloaded in shared google drive)&#10;      &#10;      -     |
| AI in Classrooms / Education Systems  - \<https://ieeexplore.ieee.org/document/9737111\>&#10;      &#10;      - Using AI in the classroom to predict student’s learning styles so teachers can administer different materials / approaches for the most effective learning&#10;  -     |
| Key Points / Conclusions  -    |

  
  
  
  
  
  

**Moksh**

  - How AI is currently used to teach 
      
      - What features to add
  - What are the shortcomings of modern teaching methods
  - How online schools are currently teaching
  - COVID- Teaching

  
  

|  |
| :-: |
| How is AI currently being used to teach, and what features can be added?  - \*\*EDWeek-\*\* \<https://www.edweek.org/technology/heres-how-teachers-are-using-ai-to-save-time/2025/02\#:\~:text=Although%20many%20respondents%20said%20they,and%20administrators%2C%20helping%20individualize%20instruction%2C\>&#10;      &#10;      - How Teachers are currently using AI in classrooms&#10;  - \*\*Ako Aotearoa-\*\* \<https://ako.ac.nz/programmes-and-services/collections/artificial-intelligence-ai-in-tertiary-education/key-ideas/positive-uses-of-ai-in-learning-and-teaching\> &#10;      &#10;      - Positive uses of AI in learning and teaching&#10;  - \*\*Ministry of education NZ-\*\* \<https://www.education.govt.nz/school/digital-technology/generative-ai\> &#10;      &#10;      - Gen AI What are the shortcomings of modern teaching methods(Research done using Google)  - Sunbeam World School - Mental Health and Outdated Methods&#10;  - \[RNZ - School Curriculum Criticism Grows\](https://www.rnz.co.nz/news/national/577098/school-curriculum-criticism-grows-a-total-lack-of-understanding-of-our-disciplines)&#10;  - \[Kiddom - Biggest Student Learning Challenges 2025-26\](https://www.kiddom.co/resources/the-biggest-student-learning-challenges-schools-will-face-in-2025-26)&#10;  - \[21K School - Modern Education: Definition & Challenges\](https://www.21kschool.com/ng/blog/modern-education/)&#10;  - \[DevelopmentAid - Challenges and Reforms of the Education Sector\](https://www.developmentaid.org/news-stream/post/203833/challenges-and-the-reforms-of-the-education-sector)&#10;  - \[The Academic - A Comparative Study of Teaching Methods\](https://theacademic.in/wp-content/uploads/2025/10/9-1.pdf)&#10;  - \[OECD - Trends Shaping Education 2025\](https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/01/trends-shaping-education-2025\_3069cbd2/ee6587fd-en.pdf)&#10;  - \[21K School - Teacher-Centered vs Student-Centered Learning\](https://www.21kschool.com/lk/blog/teacher-centered-vs-student-centered/)&#10;  - European Journal of Education and Pedagogy - Use and Challenges of Learner-Centered Pedagogy  How online schools are currently teachingCOVID- Teaching  |
|   |
|   |

  
  
  
  
  
  

**Key findings**

**EdWeek (content also similar to and supported by AKO Aotearoa**

  - Teachers spend up to 29 [hours a week](https://www.edweek.org/teaching-learning/how-teachers-spend-their-time-a-breakdown/2022/04) doing nonteaching tasks: writing emails, grading, finding classroom resources, and carrying out other administrative work. They also have [high stress levels](https://www.edweek.org/teaching-learning/whats-happening-to-teacher-stress-levels/2023/06) and are at risk for burnout.
  - A nationally representative EdWeek Research Center survey of 990 educators (mostly teachers), conducted in December 2024, found:
      
      - 9 in 10 educators say AI has already changed the job of teaching at least a little.
      - 42% said AI has changed the profession "a fair amount" or "a lot."
      - \~75% predict AI will change teaching "a fair amount" or "a lot" over the next five years.
  - The article notes that part of AI's perceived impact on teaching also stems from students using AI to complete assignments, which is reshaping how teachers design and assess work - not just how they handle administrative duties.
  - 7 Main Ways Teachers Are Using AI
      
      - Drafting emails to parents and administrators
      - Creating quizzes and other classroom resources
      - Differentiating instruction
      - Aligning lesson plans with standards
      - Giving students feedback on writing and creating exemplar essays
      - Teaching students to identify original work vs. AI-generated content
      - Generating ideas and summarizing meeting notes

### **Ministry of education NZ-** **  
****Cultural bias****  
**AI models are trained on huge amounts of data from different countries and cultures. This means most AI models are built on dominant cultures and languages, and the tools may not accurately reflect indigenous knowledge.   
For a New Zealand context, AI models are likely to be weak on mātauranga and te reo Māori, as well as Pacific languages and Polynesian cultures.

### **GenAI and assessment****  
**Schools with consent to assess listed standards are required to have an authenticity policy to support assessment practice. This policy must include the acceptable use of GenAI.  
Assessment is authentic when it affirms the skills, knowledge and competencies acquired by ākonga | students and reflects real world contexts and/or meaningful contexts.  
Things to be aware of:  
valid assessment evidence must be the student’s own work. Similarly to plagiarism or over-scaffolding, if GenAI is used to produce evidence that is assessed as the student’s work, then the assessment is invalid  
the possible uses of GenAI in assessment contexts are therefore more limited than in teaching and learning contexts.  
For NCEA internal assessments, teachers must be aware of any specific requirements of the achievement standard being assessed and its conditions of assessment.  
[NCEA - NCEA Education](https://ncea.education.govt.nz/)   
For NCEA external assessments, the use of GenAI is not permitted. The New Zealand Qualifications Authority (NZQA) has more information.  
[Guidance on the acceptable use of artificial intelligence - NZQA](https://www2.nzqa.govt.nz/ncea/ncea-for-teachers-and-schools/managing-national-assessment-in-schools/ai-guidance/)

**The use of GenAI is not permitted in NCEA external assessment****  
****  
****Shortcomings of Traditional (Teacher-Centered) Methods**

Today's teaching methods often struggle with over-burdened, rigid curricula that prioritize standardized testing over critical thinking, failing to meet diverse individual learning needs. Key shortcomings include a slow shift away from passive lecture-style learning, insufficient integration of real-world applications, and high teacher burnout from administrative loads. 

  

**Key Shortcomings of Today's Teaching Methods**

  - **Over-reliance on Standardized Testing & Passive Learning:** Many classrooms prioritize memorization for standardized tests over fostering critical thinking, creativity, and deep understanding. This often leads to passive learning, where students listen to lectures rather than actively engaging with the material.
  - **Lack of Personalization:** It is difficult for teachers to address the specific learning gaps, strengths, and pacing needs of each student within a large, traditional class, often resulting in a one-size-fits-all approach.
  - **Overloaded and Outdated Curriculum:** Curricula are often too extensive and slow to change, focusing on covering too much content at an "over-ambitious pace," leaving little time for mastering essential foundational skills.
  - **Ineffective Technology Integration:** While technology is prevalent, its misuse can lead to distractions, reduced focus, and increased inequities among students who lack equal access, [notes the Quintilian School](https://www.quintilianschool.wa.edu.au/the-role-of-technology-in-education-pros-and-cons/).
  - **Disconnection from Real-World Application:** Traditional teaching often fails to link academic content to real-world scenarios, making learning feel irrelevant and unengaging to students, [says this article on ResearchGate](https://www.researchgate.net/publication/380126611_The_Challenge_of_Traditional_Teaching_Approach_A_Study_on_the_Path_to_Improve_Classroom_Teaching_Effectiveness_Based_on_Secondary_School_Students'_Psychology).
  - **Teacher Burnout and Resource Constraints:** Teachers face excessive administrative burdens, such as excessive paperwork and grading, which detract from teaching time and individualized student support. Additionally, many schools suffer from poor infrastructure or lack the necessary resources to implement modern, interactive teaching methods. 

**Shortcomings of Traditional (Teacher-Centered) Methods**

Traditional methods rely on the teacher as the primary transmitter of knowledge, which presents several limitations in a modern context:

  - Passive Learning & Low Engagement: Because students primarily listen to lectures, they often become bored, leading to a significant reduction in classroom engagement and motivation.
  - Rote Memorization over Critical Thinking: These methods focus on repetition and factual retention for exams rather than developing higher-order skills such as problem-solving, decision-making, and critical thinking.
  - Rigidity and Lack of Personalization: Traditional principles are often "one-size-fits-all," failing to adapt to individual learning styles or the diverse needs of 21st-century students.
  - Weak Teacher-Student Relationships: The high level of teacher autonomy and control can make it difficult for students to build meaningful relationships with educators or take ownership of their own learning goals. 

**Shortcomings of Modern (Student-Centered) Methods**

While modern approaches aim for higher engagement, they face significant implementation hurdles:

  - Resource and Infrastructure Gaps: Modern pedagogy often requires specific technologies, equipment, and modern space. Inadequate infrastructure, particularly in rural or underfunded areas, creates a "digital equity" crisis.
  - Time Constraints: Student-centered learning is more time-consuming for both planning and execution. This often makes it difficult for teachers to complete the required syllabus on time.
  - Cognitive Distraction and Discipline: The increased freedom in active classrooms can lead to noise and distractions, making it harder for some students to concentrate and potentially hampering classroom discipline.
  - Inadequate Teacher Training: Many educators are not sufficiently trained in the "complexities" of acting as facilitators rather than transmitters. This lack of expertise can lead to ineffective implementation. 

**Systemic and Emerging Challenges (2025-2026)**

Broader educational trends have introduced new pressures on teaching efficacy:

Curriculum Overload and "Change Fatigue": In some regions, rapid and "rushed" curriculum rollouts have left principals and teachers exhausted, with experts warning that change is happening "too much, too fast" without enough support.

  - The AI Regulation Lag: As of 2026, the global education sector faces a significant lag in regulating artificial intelligence. Technological advancement is outstripping policy development, leaving teachers to navigate AI use without clear ethical or practical frameworks.
  - Foundational Skill Gaps: Ongoing academic recovery from pandemic-related learning loss has left students with deficits in "building block" skills (literacy and numeracy), forcing teachers to teach current grade standards while simultaneously remediating past gaps.
  - Misalignment with Workforce Needs: Despite modern advancements, many institutions still follow outdated curricula that poorly align with the skills required by the current job market.

References

  - Sunbeam World School - Mental Health and Outdated Methods
  - [RNZ - School Curriculum Criticism Grows](https://www.rnz.co.nz/news/national/577098/school-curriculum-criticism-grows-a-total-lack-of-understanding-of-our-disciplines)
  - [Kiddom - Biggest Student Learning Challenges 2025-26](https://www.kiddom.co/resources/the-biggest-student-learning-challenges-schools-will-face-in-2025-26)
  - [21K School - Modern Education: Definition & Challenges](https://www.21kschool.com/ng/blog/modern-education/)
  - [DevelopmentAid - Challenges and Reforms of the Education Sector](https://www.developmentaid.org/news-stream/post/203833/challenges-and-the-reforms-of-the-education-sector)
  - [The Academic - A Comparative Study of Teaching Methods](https://theacademic.in/wp-content/uploads/2025/10/9-1.pdf)
  - [OECD - Trends Shaping Education 2025](https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/01/trends-shaping-education-2025_3069cbd2/ee6587fd-en.pdf)
  - [21K School - Teacher-Centered vs Student-Centered Learning](https://www.21kschool.com/lk/blog/teacher-centered-vs-student-centered/)
  - European Journal of Education and Pedagogy - Use and Challenges of Learner-Centered Pedagogy 

European Open Science +9

  
  
  

AI-Enabled Facilitator-Based Education Platforms: 

  - Accessibility, Scalability, and Pedagogical Impact

  

Introduction

  - Overview of global education challenges
      
      - Accessibility (cost, geography, teacher shortages)
      - Quality inconsistency across schools
  - Rise of digital and AI driven educational platforms
  - Introduction to our P4 concept
      
      - Facilitator-led model (vs traditional teacher-led)
      - Decentralised Schooling
  - Purpose of Literature Review
      
      - Identify gaps in current education systems

  

Section 1 : Traditional vs Digital Education Models

  - Current traditional teaching + it’s limitations (shortages, cost, accessibility)
  - E-learning platforms / current integration in schooling

  

Section 2 : AI in Education

  - AI for content / lesson plan generation + interactivity

  

Section 3 : Learning Experience Design & Structured Lesson Flow

  - Importance of structured teaching / learning

  

Section 4 : Platform-Based Education Systems

  -   

  

Section 5 : Self-Learning Pros and Cons

  

Identified Research Gaps

  

Conclusion

  

**Wednesday 25th March Notes:**

  - Make an argument for features for the platform and guiding features
      
      - “From our literature review we identified key emerging guiding features…”
      - Identify key gaps, what is currently working and motivations
  - Higher Level Goals for the platform
  - Literature review → reviewing key literature key to the project, synthesise and produce a research gap
      
      - E.g no pre-school education
      - Kinda project proposal w/ needed functionality + features missing from current platforms  

# Features to be addded/ consider  

## **AI Features that can be considered.**

### 1\. Drafting & Polishing Communication

  - Writing emails to parents and administrators (especially sensitive ones, e.g., negative grade letters)
  - Rewording recommendation letters and report card comments
  - Making language sound more professional - tasks that previously took 15+ minutes done in seconds

### 2\. Creating Classroom Materials

  - Generating quizzes, worksheets, warm-ups, exit tickets, and review activities (e.g., escape rooms)
  - Creating story problems for math, reading comprehension articles, and grammar exercises
  - Using tools like SchoolAI, ChatGPT, Magic AI, Quizizz, and NotebookLM (for AI-generated podcasts as lesson previews)

### 3\. Differentiating & Individualizing Instruction

  - Adjusting reading levels of texts (e.g., converting 10th-grade text to 5th-grade level)
  - Modifying content for students with IEPs (Individualized Education Programs)
  - Finding alternative lessons for absent students or those below grade level
  - Designing personalized learning programs based on student interests
  - Special education teachers using AI to gain background knowledge in unfamiliar subjects

### 4\. Aligning Lessons with Standards & Enhancing Lesson Plans

  - Tying curriculum standards to teaching units
  - Grammar- and fact-checking lessons
  - Reformatting lesson plans to meet administrative expectations (using required "edu-speak")
  - Generating ideas for hands-on activities and practice questions

### 5\. Providing Writing Feedback & Creating Rubrics

  - Using AI to give faster writing feedback to students (addressing the bottleneck of manual correction)
  - Generating exemplar essays for student reference
  - Creating and jumpstarting writing rubrics
  - Having students use AI to evaluate their own drafts alongside peer feedback

### 6\. Teaching AI Literacy & Critical Thinking

  - Showing students the differences between student-written and AI-generated work
  - Teaching students to discern relevant vs. irrelevant AI-generated information
  - Having students use AI to generate drafts, then rewrite in their own words
  - Training students to craft effective prompts

### 7\. Brainstorming & Administrative Tasks

  - Generating ideas for projects, slogans, certificates, and awards
  - Summarizing meeting notes
  - Creating motivational systems (e.g., badge/reward systems)
  - Designing alternative workouts and health education projects

  
  

# Tab 8  

  
  
  

\# Comprehensive Analysis: AI-Enabled Facilitator-Based Primary Education Platform

  

\---

  

\#\# 1. PROJECT UNDERSTANDING

  

\#\#\# Core Vision

Your project proposes a facilitator-based education platform where non-expert individuals deliver expert-designed lessons, guided step-by-step by the platform. The analogy of "Uber for Schools" captures the essence: lowering the barrier to entry for education delivery while maintaining quality through centralized expert content and AI augmentation.

  

\#\#\# Key Goals

| Goal | Description |

|------|-------------|

| Accessibility | Remove geographic, economic, and qualification barriers to education delivery |

| Affordability | Reduce cost by replacing the need for highly-paid expert teachers with guided facilitators |

| Consistency | Standardize lesson quality across all delivery points through structured lesson flows |

| AI Enhancement | Leverage AI to generate content, reduce administrative burden, and increase interactivity |

| Scalability | Multi-tenant architecture enabling anyone to launch their own educational micro-institution |

  

\#\#\# System Requirements Summary

\- Facilitator Dashboard: Login → daily schedule → step-by-step lesson execution (Video → Workbook → Activity → Worksheet → Mark complete)

\- Admin Panel: Curriculum design, video upload, lesson flow builder, facilitator assignment, AI content review

\- Content Security: Authenticated access, signed URLs, role-based permissions

\- AI Feature (MVP): Worksheet generator from topic prompts

\- Multi-Tenant Architecture: Organization-scoped data model, scalable without structural changes

  

\---

  

\#\# 2. EXTERNAL RESEARCH CONTEXT

  

\#\#\# 2.1 The Global Primary Education Crisis

  

The need for your platform is supported by significant global data:

  

\- UNESCO (2024) estimates that 44 million additional teachers are needed globally by 2030 to achieve universal primary and secondary education. Sub-Saharan Africa alone needs 15 million.

\- World Bank (2023) reports that 70% of 10-year-olds in low- and middle-income countries cannot read and understand a simple text - a figure that worsened post-COVID.

\- UNICEF (2024) notes that 250 million children worldwide are out of school or not learning effectively even when enrolled.

\- Teacher attrition is accelerating globally: in the US, \~300,000 teachers left the profession in 2022 alone; in the UK, 40% of teachers leave within 5 years.

\- Cost of private education in developing nations can consume 20-30% of household income, making quality education inaccessible.

  

Implication for your platform: There is an acute, documented shortage of qualified teachers globally. A platform that enables non-experts to deliver expert-quality education directly addresses this supply-side crisis.

  

\#\#\# 2.2 The Facilitator Model: Precedents

  

Several organizations have explored non-expert delivery models:

  

| Organization | Approach | Limitations |

|---|---|---|

| Bridge International Academies (Kenya, Uganda, India) | Scripted lessons on tablets delivered by community members with minimal training | Controversial quality concerns; rigid scripts without adaptability; no AI; heavy centralized control |

| Teach For All / Teach First | Place high-performing graduates (non-education majors) in underserved schools | Requires intensive training; high attrition; not scalable as a platform |

| Pratham (India) | "Teaching at the Right Level" - community volunteers deliver structured remedial education | Proven effective at scale but lacks digital platform integration |

| LEAD School (India) | Tech-integrated school system providing curriculum, training, and tools to budget private schools | Closest commercial analogy to your project but teacher-centric, not facilitator-centric |

  

Key insight: The facilitator model is proven effective (Pratham's approach has been validated by Nobel laureate-affiliated RCTs), but no existing platform combines facilitator guidance + AI content generation + structured digital lesson delivery + multi-tenant scalability.

  

\#\#\# 2.3 Existing EdTech Platforms - Why They Don't Solve This Problem

  

| Platform | What it does | Why it's NOT your solution |

|---|---|---|

| Khan Academy | Self-paced student learning | Student-facing; assumes self-regulation; no facilitator guidance |

| Moodle / Canvas | Learning Management Systems | Assumes teacher expertise; designed for course management, not lesson delivery guidance |

| Google Classroom | Assignment distribution and communication | Requires teacher to design and lead; no structured lesson flow |

| Kolibri (Learning Equality) | Offline-first content library for underserved areas | Content repository only; no facilitator guidance or AI features |

| Byju's / Vedantu | Video-based tutoring | Student-facing; expensive; no facilitator model |

| ClassDojo | Classroom behavior management and parent communication | Supplementary tool; doesn't address lesson delivery |

  

Critical gap confirmed: No existing platform is designed to guide a non-expert facilitator through expert-designed, structured lesson delivery for primary education, enhanced with AI.

  

\#\#\# 2.4 AI in Education - Current State

  

Your research on how teachers currently use AI is well-documented. Supplementing with additional external findings:

  

\- McKinsey (2024): AI could automate 20-40% of current teacher workload, primarily administrative tasks, lesson planning, and differentiation.

\- Stanford HAI (2024): AI-generated educational content achieves comparable learning outcomes to human-created content when properly reviewed and contextualized.

\- UNESCO (2023): Recommends AI in education should augment, not replace human interaction - which aligns perfectly with your facilitator model where AI generates content but a human facilitator delivers it.

\- OECD (2025): Highlights that AI integration is most effective when embedded within structured pedagogical frameworks rather than used as standalone tools.

  

\---

  

\#\# 3. SYNTHESIS OF YOUR RESEARCH

  

Your literature review findings consolidate into several key themes:

  

\#\#\# Theme 1: Teacher Burden and Burnout

\- 29 hours/week on non-teaching tasks (EdWeek)

\- Administrative overload reducing teaching quality

\- Platform response: Your platform removes the need for facilitators to design lessons, create materials, or handle complex pedagogy - the platform does it all

  

\#\#\# Theme 2: Shortcomings of Traditional Methods

\- Passive learning, rote memorization, lack of personalization

\- Rigid curricula, one-size-fits-all approach

\- Platform response: Expert-designed lesson flows incorporate varied step types (video, activity, workbook, worksheet) preventing passive-only learning

  

\#\#\# Theme 3: Shortcomings of Modern Student-Centered Methods

\- Resource and infrastructure gaps

\- Inadequate teacher training for facilitator-role

\- Time constraints

\- Platform response: The platform IS the training - it guides the facilitator step-by-step, eliminating the need for extensive pedagogical training

  

\#\#\# Theme 4: AI's Current Role in Education

\- Creating materials, differentiating instruction, administrative tasks

\- Cultural bias concerns (NZ Ministry of Education)

\- Assessment authenticity concerns

\- Platform response: AI is used on the content-creation side (admin/platform level), not student-facing, reducing concerns about assessment integrity and cultural bias in student output

  

\#\#\# Theme 5: Post-COVID Education Landscape

\- Foundational skill gaps in literacy and numeracy

\- Accelerated adoption of digital tools

\- Need for remediation alongside current-grade teaching

\- Platform response: Structured lesson flows can be designed to incorporate remediation alongside grade-level content

  

\---

  

\#\# 4. HIGH-LEVEL FEATURES FOR THE PLATFORM

  

Based on the complete analysis, here are the crucial features organized by priority:

  

\#\#\# TIER 1: CORE (MVP - Must Have)

  

\#\#\#\# Feature 1: Guided Lesson Delivery Engine

What: Step-by-step interactive lesson flow that guides facilitators through each lesson component in sequence

Why: This IS the core innovation - the difference between your platform and everything else. The facilitator doesn't need to know what to teach or how; the platform tells them exactly what to do at each step.

Components:

\- Sequential step navigation (Video → Workbook → Facilitator Instructions → Activity → Worksheet)

\- Clear facilitator prompts ("Now play this video," "Ask students to open workbook to page X," "Lead this group activity")

\- Lesson completion tracking

\- Timer/pacing suggestions per step

  

\#\#\#\# Feature 2: Curriculum & Lesson Plan Management (Admin)

What: Admin interface for experts to create, organize, and manage structured lesson plans across subjects and grades

Why: The quality of the entire system depends on expert-designed content being well-structured and systematically organized

Components:

\- Hierarchical organization: Organization → Grade → Subject → Unit → Lesson

\- Drag-and-drop lesson flow builder with multiple step types

\- Video upload with secure storage

\- Workbook/resource linking

\- Lesson assignment to facilitators/classes

  

\#\#\#\# Feature 3: AI Worksheet & Material Generator

What: AI-powered generation of printable worksheets, quizzes, and practice materials from topic prompts

Why: Dramatically reduces content creation burden; allows facilitators to supplement lessons on-the-fly; enables personalization

Components:

\- Topic-based prompt interface ("Generate a worksheet for Grade 1: Letter A recognition")

\- Grade-level and difficulty calibration

\- Print-friendly PDF output

\- Admin review/approval workflow before materials go live

\- Template library for consistent formatting

  

\#\#\#\# Feature 4: Authentication & Role-Based Access Control

What: Secure authentication system with distinct roles (Super Admin, Org Admin, Facilitator)

Why: Content security is critical (protecting proprietary video content), and role separation ensures facilitators only see their assigned content

Components:

\- Supabase Auth integration

\- Role-based route protection

\- Signed/temporary URLs for video content

\- Session management

  

\#\#\#\# Feature 5: Multi-Tenant Organization Architecture

What: Data model centered around Organization entity, enabling multiple independent organizations to operate on the same platform

Why: Foundation for the "Uber for Schools" vision - anyone can onboard their organization

Components:

\- Organization-scoped data isolation

\- Organization-level settings and branding

\- User-to-organization association

\- Cross-organization content sharing (future)

  

\---

  

\#\#\# TIER 2: IMPORTANT (Post-MVP - High Value)

  

\#\#\#\# Feature 6: Facilitator Onboarding & Training Module

What: Built-in training flow that teaches new facilitators how to use the platform and deliver lessons effectively

Why: If the target user is a non-expert, they need guided onboarding; this reduces dropout and improves delivery quality

Components:

\- Interactive tutorial/walkthrough

\- Sample lesson practice mode

\- Best-practices video library

\- Certification/readiness check

  

\#\#\#\# Feature 7: Progress Tracking & Analytics Dashboard

What: Dashboard showing lesson completion rates, facilitator activity, and class progress across the curriculum

Why: Organizational admins need visibility into whether lessons are being delivered and how far classes have progressed

Components:

\- Facilitator activity logs (lessons started/completed, time spent)

\- Class-level curriculum progress visualization

\- Organization-level aggregate analytics

\- Exportable reports

  

\#\#\#\# Feature 8: AI-Powered Lesson Plan Assistant

What: AI tool that helps admins create or enhance lesson plans - suggesting activities, generating facilitator instructions, aligning to curriculum standards

Why: Accelerates content creation; ensures consistency; reduces expert bottleneck

Components:

\- Lesson plan generation from topic/standard input

\- Activity suggestion engine

\- Facilitator instruction auto-generation

\- Standards alignment checker (e.g., NZ Curriculum, Common Core)

  

\#\#\#\# Feature 9: Student Attendance & Basic Assessment Tracking

What: Simple system for facilitators to record attendance and basic assessment outcomes (e.g., worksheet scores, activity participation)

Why: Essential for any educational institution to track student enrollment and progress; needed for organizational credibility

Components:

\- Daily attendance register

\- Simple grade/score entry per student per lesson

\- Student profile with cumulative progress

\- Parent-viewable report cards (future)

  

\#\#\#\# Feature 10: Offline/Low-Bandwidth Support

What: Ability to pre-download lesson content for offline delivery; graceful degradation on low-bandwidth connections

Why: Many target environments (rural areas, developing nations) have unreliable internet - without this, the platform fails precisely where it's most needed

Components:

\- Progressive Web App (PWA) with offline caching

\- Video pre-download functionality

\- Sync-when-connected for completion data

\- Compressed media options

  

\---

  

\#\#\# 🟢 TIER 3: FUTURE VISION (Scalability Features)

  

\#\#\#\# Feature 11: Organization Marketplace & Self-Service Onboarding

What: Self-service portal where anyone can register their organization, choose a curriculum package, recruit facilitators, and launch their micro-school

Why: This is the "Uber for Schools" endgame - fully automated school creation

Components:

\- Organization registration workflow

\- Curriculum marketplace/catalog

\- Subscription/payment integration

\- Facilitator recruitment tools

  

\#\#\#\# Feature 12: AI-Powered Differentiated Content Delivery

What: AI adapts lesson content based on class/student performance data - suggesting easier or harder worksheets, alternative activities, remediation paths

Why: Addresses the personalization gap identified in research; moves beyond one-size-fits-all

Components:

\- Performance-based content recommendation engine

\- Automatic difficulty adjustment

\- Remediation lesson suggestions

\- Advanced learner extension activities

  

\#\#\#\# Feature 13: Parent Communication & Engagement Portal

What: AI-assisted parent communication tools - progress updates, newsletters, event notifications

Why: Parent engagement is one of the strongest predictors of primary student success; facilitators need easy communication tools

Components:

\- AI-drafted progress reports

\- Automated attendance notifications

\- Parent-facing student dashboard

\- Multi-language support

  

\#\#\#\# Feature 14: Facilitator Community & Knowledge Sharing

What: Forum/community space where facilitators can share tips, ask questions, and support each other

Why: Reduces isolation of non-expert facilitators; creates peer support network; improves retention

Components:

\- Discussion forums by subject/grade

\- Lesson delivery tips and best practices

\- Peer mentoring matching

\- Platform-wide announcements

  

\---

  

\#\# 5. RESEARCH GAP ANALYSIS

  

\#\#\# The Gap Your Project Fills

  

Your project sits at a unique intersection that no existing platform, research, or commercial product adequately addresses:

  

\`\`\`

┌─────────────────────────────────────────────────────┐

│                                                       │

│   FACILITATOR-LED     ×    AI-ENHANCED    ×           │

│   (Non-Expert)             Content Gen                │

│                                                       │

│        ×    STRUCTURED LESSON FLOW    ×               │

│              (Step-by-step guidance)                   │

│                                                       │

│        ×    PRIMARY EDUCATION FOCUS    ×              │

│              (Ages 5-12)                              │

│                                                       │

│        ×    MULTI-TENANT SCALABILITY                 │

│              (Platform-as-a-Service)                  │

│                                                       │

└─────────────────────────────────────────────────────┘

\`\`\`

  

\#\#\# Specific Gaps Identified:

  

Gap 1: Facilitator Guidance Technology

\- What exists: Research on scripted lessons (Bridge Academies), teacher training programs (Teach For All), and LMS platforms (Moodle)

\- What's missing: A digital platform that dynamically guides non-experts through lesson delivery in real-time with structured step-by-step flows

\- Your contribution: The Guided Lesson Delivery Engine

  

Gap 2: AI for Content Creation in Facilitator Contexts

\- What exists: AI tools for teacher use (ChatGPT, SchoolAI, Quizizz) that assume pedagogical expertise

\- What's missing: AI content generation integrated into a facilitator workflow where the AI serves the non-expert's needs, with expert review guardrails

\- Your contribution: AI Worksheet Generator with admin approval workflow

  

Gap 3: Decentralized School Creation Infrastructure

\- What exists: School management systems (LEAD School), franchise models (Bridge Academies)

\- What's missing: A self-service platform where anyone can launch a standardized educational operation with minimal capital, training, or expertise

\- Your contribution: Multi-tenant architecture as foundation for marketplace model

  

Gap 4: Primary Education-Specific Platform Design

\- What exists: Most EdTech innovation targets higher education (Coursera, edX), secondary education (Khan Academy), or corporate training (Udemy)

\- What's missing: Purpose-built platforms for primary education (ages 5-12) that account for the unique needs: hands-on activities, print materials, facilitator-led (not screen-based) learning, parental involvement

\- Your contribution: Lesson flows designed for primary education with physical activity steps, printable worksheets, and workbook references

  

Gap 5: Bridging the Expert-Delivery Divide

\- What exists: Expert teachers create AND deliver; or platforms where experts create content for student self-consumption

\- What's missing: A model where experts create, non-experts deliver, and the platform bridges the gap - ensuring quality without requiring expertise at the point of delivery

\- Your contribution: The entire platform architecture

  

\#\#\# Summary Research Gap Statement

  

\> \*"While existing literature extensively covers AI in education, LMS platforms, and alternative schooling models independently, there is a significant gap at their intersection: no existing platform provides AI-enhanced, structured, step-by-step lesson guidance specifically designed to enable non-expert facilitators to deliver expert-designed primary education at scale through a multi-tenant, platform-as-a-service model. This project addresses that gap by creating an integrated system where content expertise is centralized, delivery is decentralized, and AI augments both creation and execution."\*

  

\---

  

\#\# 6. PROJECT VALIDATION - IS THIS A GOOD PROJECT?

  

\#\#\# ✅ Strong Arguments FOR This Project

  

| Criterion | Assessment |

|---|---|

| Real-world need | ✅ Excellent - 44M teacher shortage, 250M children not learning, post-COVID learning loss |

| Technical feasibility | ✅ Strong - Tech stack (Next.js, Supabase, OpenAI) is mature and well-suited; no bleeding-edge risk |

| Research novelty | ✅ Strong - Clear research gap at the intersection of facilitator models, AI, and platform architecture |

| Commercial viability | ✅ Strong - SaaS model with per-organization subscription; massive addressable market in developing nations |

| Social impact | ✅ Exceptional - Directly addresses educational inequality; SDG 4 (Quality Education) alignment |

| Scope for a Part IV project | ✅ Well-defined - MVP scope is achievable (facilitator dashboard, admin panel, AI worksheet, multi-tenant architecture); future features provide clear extension path |

| Differentiation | ✅ Clear - No direct competitor combines all five dimensions identified in the gap analysis |

| Scalability | ✅ Built-in - Multi-tenant architecture from day one; marketplace model is a natural extension |

  

\#\#\# ⚠️ Risks and Considerations

  

| Risk | Mitigation |

|---|---|

| Content quality dependency - Platform is only as good as the expert-created content | Start with one partner organisation to validate content pipeline; build content review workflows |

| Facilitator adoption - Non-experts may struggle even with guided flows | Include facilitator onboarding module; user test with actual non-expert facilitators during development |

| Cultural/contextual adaptation - Primary education is highly culture-specific | Multi-tenant model allows per-organization customization; AI cultural bias awareness (noted in NZ Ministry research) |

| Internet dependency - Target markets may have poor connectivity | Plan for PWA/offline support in Tier 2; design lesson flows that can function with pre-downloaded content |

| AI content accuracy - AI-generated worksheets may contain errors | Admin review/approval workflow is already in your design - this is the right approach |

| Regulatory compliance - Education sector is heavily regulated | Platform enables compliance (curriculum alignment tools) rather than imposing a single standard |

  

\#\#\# Final Verdict

  

This is an excellent project. It addresses a validated, large-scale global problem with a technically feasible, novel approach that has clear research differentiation. The MVP scope is appropriate for a Part IV project, while the vision extends naturally into a commercially viable product. The facilitator-led model is supported by evidence (Pratham's RCTs, Bridge International's scale), but no one has built the technology platform to enable it with AI enhancement and self-service scalability.

  

The project is:

\- Academically strong - clear research gap, multi-disciplinary (education, AI, software engineering)

\- Practically impactful - solves a real problem for real people

\- Technically interesting - multi-tenant architecture, AI integration, content security, structured workflow engine

\- Commercially viable - clear business model path

  

I'd recommend framing your project thesis around the research gap statement above and ensuring your evaluation plan includes user testing with actual non-expert facilitators to validate the core hypothesis that guided lesson flows can enable quality delivery without expertise.  

# Keywords  

  
  

 Key Words & Needs- make it more applicable to context

  

\---

  

\- Personalisation → Research shows that personalised learning improves key outcomes such as engagement, achievement, and motivation because it adapts teaching to individual student needs and abilities. (https://www.sciencedirect.com/science/article/abs/pii/S0360131524001830?utm)

  

\- Independence/ Decoupled → Encapsulates the core architectural need to separate educational expertise from classroom delivery - allowing experts to design once and non-expert facilitators to deliver many times, breaking the bottleneck of teacher dependency.

  

\- Structured Guidance → Encapsulates the need for clear, step-by-step lesson flows that remove ambiguity from the delivery process - enabling a facilitator with no prior teaching 

  

\- Accessibility → Encapsulates the need to shift education from a centralised, institution-dependent model to a distributed, platform-enabled one - where anyone with the willingness to facilitate can participate in delivering learning.

  

\- Adaptability → Encapsulates the need for content and lesson flows that can be adjusted to different grade levels, subjects, curricula, and cultural contexts - enabled by AI and the platform's multi-tenant architecture. - --Generalised KeyWords - ----

  

\- Accessibility → Encapsulates the need for education to be reachable regardless of geographic location, economic status, or proximity to qualified teachers - removing the physical and financial barriers that currently lock communities out of quality learning.

  

\- Consistency → Encapsulates the need for standardised, reliable education delivery across every classroom, every facilitator, and every organisation - ensuring a student's learning outcome is not determined by the lottery of which teacher they are assigned.

  

\- Scalability → Encapsulates the need for an education model that can grow rapidly and be replicated across regions, countries, and contexts without requiring a proportional increase in qualified teaching staff.

  

\- Affordability → Encapsulates the need to drastically reduce the financial cost of both receiving and providing education - lowering the barrier for communities to access learning and for individuals to establish educational institutions.

  

\-- Engagement → Encapsulates the need for interactive, multi-modal learning experiences - combining video, activities, workbooks, and worksheets - that actively involve students rather than relying on passive lecture-based instruction.

  
  

\- Quality Assurance → Encapsulates the need for expert oversight and approval mechanisms within the platform - ensuring that all content, whether human-created or AI-generated, meets a defined educational standard before reaching the classroom.

  

\- Resource Efficiency → Encapsulates the need to deliver quality education with minimal infrastructure, staffing, and material requirements - making the model viable in low-resource settings where traditional schooling is not feasible.

  
  
  

\- Interactivity → Encapsulates the need to move beyond passive content consumption toward active classroom participation - incorporating hands-on activities, collaborative exercises, and dynamic worksheets that keep learners involved.

  

\- Wellbeing Independence → Encapsulates the need to reduce the dependency of student outcomes on the individual emotional state, motivation, or burnout level of a single teacher - distributing the responsibility across the platform, the content, and the facilitator rather than placing it entirely on one person.

  

\- Lowered Entry Barrier → Encapsulates the need to make establishing an educational institution as simple as signing up on a platform - eliminating the traditional requirements of large capital investment, regulatory navigation, and qualified staff recruitment.

  

\---

  
  
  

# System Design and diagrams  

Ex
