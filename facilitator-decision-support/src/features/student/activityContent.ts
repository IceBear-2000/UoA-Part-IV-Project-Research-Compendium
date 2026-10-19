import type { QuestionType } from "@/shared/types/activity";

export type LiteracyQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  answers: string[];
  correctAnswer: string;
  hint: string;
};

export type LiteracyActivity = {
  id: string;
  title: string;
  storyTitle: string;
  passage: string;
  questions: LiteracyQuestion[];
};

export const literacyActivities: LiteracyActivity[] = [
  {
    id: "literacy-main-idea-1",
    title: "Finding the main idea",
    storyTitle: "The Classroom Sunflowers",
    passage:
      "Mia planted three sunflower seeds in a small pot by the classroom window. Each morning she checked the soil, added a little water, and turned the pot so every side could reach the sun. After two weeks, tiny green shoots appeared. Mia smiled because her careful routine was helping the plants grow.",
    questions: [
      {
        id: "sunflowers-detail-1",
        type: "literal",
        prompt: "How many sunflower seeds did Mia plant?",
        answers: ["One", "Two", "Three", "Four"],
        correctAnswer: "Three",
        hint: "Look back at the first sentence of the passage.",
      },
      {
        id: "sunflowers-detail-2",
        type: "literal",
        prompt: "Which detail best supports the main idea?",
        answers: [
          "Mia checked the soil and added water each morning.",
          "The pot was near a classroom window.",
          "Mia smiled at the end of the passage.",
          "The shoots were green.",
        ],
        correctAnswer: "Mia checked the soil and added water each morning.",
        hint: "Look for the detail that shows Mia taking care of the seeds.",
      },
      {
        id: "sunflowers-inference-1",
        type: "inferential",
        prompt: "Why did Mia turn the pot every day?",
        answers: [
          "To make the pot look nice",
          "So every side of the plant could reach sunlight",
          "Because the teacher told her to",
          "To count the seeds",
        ],
        correctAnswer: "So every side of the plant could reach sunlight",
        hint: "Think about why turning something all the way around might help it grow evenly.",
      },
      {
        id: "main-idea",
        type: "inferential",
        prompt: "What is the main idea of the passage?",
        answers: [
          "Mia likes looking out the classroom window.",
          "Mia takes regular care of the seeds so they can grow.",
          "Sunflowers only grow inside classrooms.",
          "The plants grew because Mia smiled at them.",
        ],
        correctAnswer: "Mia takes regular care of the seeds so they can grow.",
        hint: "Think about what Mia does again and again, and what happens because of it.",
      },
    ],
  },
  {
    id: "literacy-new-student-1",
    title: "Reading about feelings and actions",
    storyTitle: "The New Student",
    passage:
      "On Monday, a new boy named Kofi joined Mr Patel's class. At lunchtime, Kofi sat alone at the end of the table and did not open his lunchbox. Aroha noticed that Kofi looked down at his hands instead of eating. She walked over, sat next to him, and asked if he wanted to play handball after lunch. Kofi looked up and smiled for the first time that day.",
    questions: [
      {
        id: "new-student-detail-1",
        type: "literal",
        prompt: "Who sat next to Kofi at lunch?",
        answers: ["Mr Patel", "Aroha", "Another new student", "No one"],
        correctAnswer: "Aroha",
        hint: "Find the name of the girl in the story.",
      },
      {
        id: "new-student-detail-2",
        type: "literal",
        prompt: "What did Aroha ask Kofi to do?",
        answers: [
          "Eat his lunch",
          "Play handball after lunch",
          "Go home early",
          "Meet Mr Patel",
        ],
        correctAnswer: "Play handball after lunch",
        hint: "Look at what Aroha said to Kofi.",
      },
      {
        id: "new-student-inference-1",
        type: "inferential",
        prompt: "Why did Kofi probably not eat his lunch at first?",
        answers: [
          "He wasn't hungry",
          "He felt nervous because he was new",
          "He forgot his lunchbox",
          "He didn't like the food",
        ],
        correctAnswer: "He felt nervous because he was new",
        hint: "Think about how someone might feel on their first day at a new school.",
      },
      {
        id: "new-student-inference-2",
        type: "inferential",
        prompt: "What does Kofi's smile at the end of the passage suggest?",
        answers: [
          "He didn't like handball",
          "He was still upset",
          "He felt better because someone was kind to him",
          "He was tired",
        ],
        correctAnswer: "He felt better because someone was kind to him",
        hint: "Think about what changed for Kofi right before he smiled.",
      },
    ],
  },
  {
    id: "literacy-rainy-day-1",
    title: "Reading about a change of plans",
    storyTitle: "The Rainy Day Plan",
    passage:
      "Ben and his sister Lily planned to ride their bikes to the park on Saturday. When they woke up, rain was falling hard against the window. Lily frowned and looked at her bike leaning against the garage wall. Ben thought for a moment, then pulled out a big box of building blocks. 'Let's build the park instead,' he said. Lily laughed and grabbed the blocks.",
    questions: [
      {
        id: "rainy-day-detail-1",
        type: "literal",
        prompt: "What was falling against the window on Saturday morning?",
        answers: ["Rain", "Leaves", "Snow", "Hail"],
        correctAnswer: "Rain",
        hint: "Look at the second sentence of the passage.",
      },
      {
        id: "rainy-day-detail-2",
        type: "literal",
        prompt: "What did Ben get out instead of going to the park?",
        answers: [
          "A board game",
          "A box of building blocks",
          "His bike",
          "A book",
        ],
        correctAnswer: "A box of building blocks",
        hint: "Look at what Ben pulled out after thinking for a moment.",
      },
      {
        id: "rainy-day-inference-1",
        type: "inferential",
        prompt: "Why did Lily frown when she saw the rain?",
        answers: [
          "She didn't like the sound of rain",
          "She was disappointed their bike plan was ruined",
          "She was cold",
          "She wanted to sleep more",
        ],
        correctAnswer: "She was disappointed their bike plan was ruined",
        hint: "Think about what she and Ben had planned to do that day.",
      },
      {
        id: "rainy-day-inference-2",
        type: "inferential",
        prompt: "Why did Ben suggest building the park with blocks?",
        answers: [
          "He didn't like riding bikes",
          "He found a way for them to still have fun together despite the rain",
          "He was bored of biking",
          "He wanted to play alone",
        ],
        correctAnswer: "He found a way for them to still have fun together despite the rain",
        hint: "Think about the problem the rain caused, and what Ben was trying to solve.",
      },
    ],
  },
];

/** Flattened lookup used by the recommendation engine to tag any question
 * by id with its literal/inferential type, regardless of which activity it
 * belongs to. Question ids are unique across all activities. */
export const allQuestions: LiteracyQuestion[] = literacyActivities.flatMap(
  (activity) => activity.questions,
);

export function getActivityById(activityId: string): LiteracyActivity {
  const activity = literacyActivities.find((item) => item.id === activityId);
  return activity ?? literacyActivities[0];
}

/** Simple round-robin selection so a student sees a different passage each
 * time they complete an activity, rather than repeating the same one -
 * supporting the intended "regular, short activity over time" design while
 * avoiding memorisation effects on repeated attempts. */
export function getActivityForAttemptNumber(attemptNumber: number): LiteracyActivity {
  const index = attemptNumber % literacyActivities.length;
  return literacyActivities[index];
}
