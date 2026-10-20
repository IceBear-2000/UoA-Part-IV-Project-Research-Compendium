# SOFTENG 700A: System Design and Planning

> **What this is.** The joint planning document from April to May 2026 that mapped the gaps found in the literature reviews to candidate features: the origin of the platform's four core components. The document's own heading says these were rough ideas, not final decisions. Its second tab was May's own early exploration of learner analysis; it is now part of her combined notes in [`04-.../01-Research/Research-and-Design-Notes.md`](../../04-Facilitator-Student-Side_May-Thazin/01-Research/Research-and-Design-Notes.md).
>
> Exported from Google Docs to Markdown on 19 October 2026 and lightly reformatted for readability. The content of the feature map is unchanged.

---

## Feature map

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

