import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { ClassBanner } from "@/lib/class-banner";
import { PitchExpand } from "./_components/PitchExpand";

const FULL_PITCH = [
  "UNESCO says the world needs 44 million more teachers by 2030. And more than half the children in poorer countries still can't read a simple sentence by age ten.",
  "The schools that feel it hardest are rural and low income, where the good teachers leave for better pay. A school hires someone, trains them up, gets them good, and then a richer school hires them away. The kids get left behind.",
  "So what if the teaching didn't have to come from the person in the room?",
  "Think about it this way. Everyone knows one plus one is two. Almost nobody can teach it to a six-year-old. Knowing and teaching are different skills, and only teaching is scarce. So what if we have facilitators — people who can answer questions — while the platform takes care of the teaching.",
  "An expert uses videos, worksheets, activities and resources to build a structured lesson. The facilitator goes through that lesson in class on a big screen: clicking through, playing videos, running the activities, and helping whoever's stuck. The facilitator facilitates learning. The platform does the teaching.",
  "This is similar to an Uber, but for schools. Running a classroom doesn't need a teaching degree anymore. And the students still get the expert.",
];

const HOW_IT_WORKS = [
  {
    title: "An expert builds the lesson — once",
    body: "Videos, activities, worksheets, assembled into an ordered sequence. This is the hard part, and it only has to happen once per lesson.",
  },
  {
    title: "A facilitator runs it live",
    body: "No teaching qualification needed. They log in, and the platform guides them through the lesson step by step on a screen in the classroom.",
  },
  {
    title: "The platform teaches. The facilitator supports.",
    body: "Plays the video, runs the activity, keeps the room on track, helps whoever's stuck. The instruction comes from the platform, not from the facilitator's own subject knowledge.",
  },
];

type Rating = "Strong" | "Partial" | "Weak";

const RATING_STYLE: Record<Rating, string> = {
  Strong: "bg-sage-soft text-[#5f7355]",
  Partial: "bg-gold-soft text-[#8d7426]",
  Weak: "bg-rose-soft text-[#946b76]",
};

function Cell({ rating, note }: { rating: Rating; note: string }) {
  return (
    <div>
      <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${RATING_STYLE[rating]}`}>
        {rating}
      </span>
      <p className="mt-1 text-[12.5px] leading-snug text-muted">{note}</p>
    </div>
  );
}

const CRITERIA = [
  "Personalisation",
  "Decoupled Delivery",
  "Structured Guidance",
  "Accessibility",
  "Adaptability",
  "Engagement",
] as const;

const COMPARISON: {
  system: string;
  highlight?: boolean;
  cells: [Rating, string][];
}[] = [
  {
    system: "StudyBuddy",
    highlight: true,
    cells: [
      ["Partial", "Curriculum-matched, not per-student"],
      ["Strong", "Any screened facilitator can run it"],
      ["Strong", "Locked, step-by-step lesson flow"],
      ["Partial", "Needs a device + internet, no offline mode yet"],
      ["Partial", "New curricula addable, no adaptive difficulty yet"],
      ["Strong", "Live human in the room + interactive blocks"],
    ],
  },
  {
    system: "Moodle",
    cells: [
      ["Partial", "Some adaptive plugins"],
      ["Weak", "Still needs a qualified teacher to run the course"],
      ["Strong", "Strong, for the teacher who built it"],
      ["Partial", "Depends on the institution"],
      ["Strong", "Highly configurable"],
      ["Weak", "Depends entirely on the teacher"],
    ],
  },
  {
    system: "Google Classroom",
    cells: [
      ["Weak", "No content adaptivity"],
      ["Weak", "A workflow layer, still needs a qualified teacher"],
      ["Weak", "Empty shell, no built-in pedagogy"],
      ["Strong", "Free, widely available"],
      ["Weak", "Not built for content adaptivity"],
      ["Weak", "Depends entirely on the teacher"],
    ],
  },
  {
    system: "Khan Academy",
    cells: [
      ["Strong", "Mastery-based, per-student"],
      ["Strong", "No facilitator needed at all"],
      ["Weak", "Self-paced only, no in-room guidance"],
      ["Strong", "Free, huge library"],
      ["Strong", "Adapts to performance"],
      ["Weak", "Low completion for K-12 without supervision"],
    ],
  },
  {
    system: "Kolibri",
    cells: [
      ["Partial", "Curated content, limited adaptivity"],
      ["Strong", "Offline content, minimal supervision needed"],
      ["Partial", "Curated, not live-guided"],
      ["Strong", "Offline-first, built for low connectivity"],
      ["Partial", "Limited"],
      ["Weak", "Same self-paced limitation"],
    ],
  },
  {
    system: "LEAD School",
    cells: [
      ["Partial", "Standard curriculum, not per-student"],
      ["Weak", "Still relies on a trained, employed teacher"],
      ["Strong", "Full curriculum + teacher training"],
      ["Partial", "Cost tied to teacher availability"],
      ["Partial", "Limited"],
      ["Strong", "Classroom-based, teacher-led"],
    ],
  },
  {
    system: "Bridge International",
    cells: [
      ["Weak", "Scripted, not personalised"],
      ["Partial", "Script replaces expertise, but a human still reads it live"],
      ["Strong", "Heavily scripted"],
      ["Partial", "Needs a tablet + trained reader"],
      ["Weak", "Rigid scripts, criticised for inflexibility"],
      ["Partial", "Present, but constrained by the script"],
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-6 pb-4 pt-8 md:px-11">
        <Link href="/login" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
          <div className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-clay text-base text-white">
            📚
          </div>
          StudyBuddy
        </Link>
        <Link
          href="/login"
          className="rounded-input border border-line bg-white px-4 py-2 text-sm font-semibold shadow-paper hover:bg-bg-2"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-6 pb-24 md:px-11">
        {/* Hero */}
        <section className="pt-6">
          <div className="relative aspect-[16/5] w-full overflow-hidden rounded-card shadow-paper-2">
            <ClassBanner classId="studybuddy-about-hero" className="h-full w-full" />
          </div>

          <h1 className="mx-auto mt-9 max-w-[720px] text-center text-[34px] font-bold leading-[1.15] tracking-tight md:text-[40px]">
            The facilitator facilitates learning.
            <br />
            The platform does the teaching.
          </h1>

          <p className="mx-auto mt-5 max-w-[640px] text-center text-[16px] leading-relaxed text-ink">
            The world is 44 million teachers short, and the good ones keep leaving the
            schools that need them most. StudyBuddy separates the teaching from the
            person in the room: an expert builds the lesson once, and any facilitator
            runs it in class, step by step, on a big screen.
          </p>

          <div className="flex flex-col items-center">
            <PitchExpand fullPitch={FULL_PITCH} />

            <Link
              href="/login"
              className="mt-7 inline-flex items-center gap-2 rounded-input bg-clay px-5 py-3 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52]"
            >
              See it in action <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </section>

        {/* Problem */}
        <section className="mt-20">
          <p className="mb-3.5 text-center text-[12px] font-semibold uppercase tracking-wide text-muted">
            The problem
          </p>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
            <div className="rounded-card border border-line bg-surface p-6 text-center shadow-paper">
              <div className="text-[34px] font-bold tracking-tight text-clay">44M</div>
              <p className="mt-1.5 text-[14px] text-ink">
                more teachers needed worldwide by 2030
              </p>
              <p className="mt-2.5 text-[11.5px] text-muted">UNESCO, 2024</p>
            </div>
            <div className="rounded-card border border-line bg-surface p-6 text-center shadow-paper">
              <div className="text-[34px] font-bold tracking-tight text-clay">50%+</div>
              <p className="mt-1.5 text-[14px] text-ink">
                of children in poorer countries can&apos;t read a simple sentence by age 10
              </p>
              <p className="mt-2.5 text-[11.5px] text-muted">World Bank, 2025</p>
            </div>
            <div className="rounded-card border border-line bg-surface p-6 text-center shadow-paper">
              <div className="text-[19px] font-bold leading-snug tracking-tight text-clay">
                The good ones leave
              </div>
              <p className="mt-2 text-[14px] text-ink">
                Better-paying schools hire away the teachers who make the difference,
                leaving the students who need them most behind.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-20">
          <p className="mb-3.5 text-center text-[12px] font-semibold uppercase tracking-wide text-muted">
            How it works
          </p>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="rounded-card border border-line bg-surface p-6 shadow-paper">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-clay text-sm font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-3.5 text-[16px] font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col items-center">
            <a
              href="https://claude.ai/artifact/JNG62EMNTd6JULCkxyYF2D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-clay hover:underline"
            >
              View the technical architecture <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
            </a>
            <p className="mt-1.5 text-[12px] text-muted">
              Data model, class diagram, lesson-flow state machine — a high-level overview.
            </p>
          </div>
        </section>

        {/* Comparison */}
        <section className="mt-20">
          <p className="mb-3.5 text-center text-[12px] font-semibold uppercase tracking-wide text-muted">
            How StudyBuddy compares
          </p>
          <p className="mx-auto max-w-[640px] text-center text-[14.5px] leading-relaxed text-muted">
            Assessed against the same six criteria used to evaluate every model of
            education delivery — from traditional classrooms to online courses to
            community tutoring.
          </p>

          <div className="mt-7 overflow-x-auto rounded-card border border-line bg-surface shadow-paper">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="w-[150px] px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-muted">
                    System
                  </th>
                  {CRITERIA.map((c) => (
                    <th
                      key={c}
                      className="px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-muted"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr
                    key={row.system}
                    className={`border-b border-line-soft last:border-b-0 ${row.highlight ? "bg-clay-soft" : ""}`}
                  >
                    <td
                      className={`px-4 py-3.5 align-top text-[13.5px] font-semibold ${row.highlight ? "text-[#8c5538]" : "text-ink"}`}
                    >
                      {row.system}
                    </td>
                    {row.cells.map(([rating, note], i) => (
                      <td key={i} className="px-4 py-3.5 align-top">
                        <Cell rating={rating} note={note} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-center text-[11.5px] text-muted">
            Assessed against publicly known product behaviour, not a formal audit.
          </p>
        </section>

        {/* Footer CTA */}
        <section className="mt-20 flex flex-col items-center rounded-card border border-line bg-surface p-10 text-center shadow-paper">
          <h2 className="text-[22px] font-bold tracking-tight">See it for yourself</h2>
          <p className="mt-1.5 max-w-[440px] text-[14.5px] text-muted">
            The real platform is live — sign in to build a lesson or run one as a facilitator.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center gap-2 rounded-input bg-clay px-5 py-3 text-sm font-semibold text-white shadow-paper transition-colors hover:bg-[#A96E52]"
          >
            Sign in <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </section>
      </main>
    </div>
  );
}
