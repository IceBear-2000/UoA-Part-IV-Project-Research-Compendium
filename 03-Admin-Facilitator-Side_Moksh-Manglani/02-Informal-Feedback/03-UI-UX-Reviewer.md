# Feedback notes: UI/UX Review (medical student and tutor)

| | |
|---|---|
| **Who** | A medical student with tutoring experience who has used several online learning and teaching platforms. She asked not to be named and is identified by role only |
| **Why her** | She has taught, and she has used platforms like this one, so she can judge it from both sides |
| **When and how** | October 2026, in person, about 20 minutes. She used the live platform on a laptop while questions were asked |
| **Looked at** | Login, facilitator dashboard, finding and running a lesson, chat with the admin; then the admin side: sign-up requests, assigning classes, list and card views, creating a lesson, the lessons page, layout and theme settings |

**In one paragraph.** A first-time user found a lesson without help and understood the locked steps straight away. Her fixes were small and specific: clearer labels on lesson cards, a back button inside a lesson, a visible way to remove a facilitator's access, "Delete" where the button said "Confirm", and more contrast between cards and their background.

> Quotes are lightly tidied for readability.

## What worked

1. **She found a lesson on her own.** Asked to act as a Grade 4 maths teacher, she went class, then subject, then lesson with no help: "it's pretty clear what it is".
2. **She understood the locked steps at once.** "You have to do one step to get to the next step, which is good."
3. **The lesson player needs nothing.** "Pretty straightforward, I don't think you need to change anything." She considered asking for part labels, then saw "step one of three" and withdrew it.
4. **She read the approval step correctly**, as a controlled system where nobody can just sign in.
5. **Clean and uncluttered.** Login: good colours, easy to read, "clear instead of clutter". She liked the dashboard greeting with the facilitator's name.
6. **Sidebar over top bar.** "That's what I'm used to."
7. **Keep both list and card views.** Cards look good; the list is easier to scroll with many facilitators.
8. **The curriculum filter helps** make lessons easier to browse.

## What confused her

9. **Labels on lesson cards.** She read "3 steps" as a three-step method for multiplication, and could not tell whether the time was for her or for the students.
10. **No obvious way back from a lesson** to the lesson list.
11. **Removing access is hidden.** "Assign" means adding only; she expected a direct remove option.
12. **"Confirm" on removing a block.** She wanted the button to say "Delete".
13. **How fast the admin replies** was her first question about the chat.

## What she would change in the look

14. **More contrast, not a new theme.** The lessons page "looks a bit too boring to my brain" because cards are close in colour to the background.
15. **Slightly bigger dashboard cards**, a personal preference.
16. **Cartoon characters, then no.** She suggested fun images for children, then withdrew it because the facilitator runs the screen and it could distract.

## Design decisions this led to

| # | Her feedback | Change | Nielsen heuristic | Status |
|---|---|---|---|---|
| 1 | Step count and time on lesson cards are ambiguous | Say what they mean | 2 Match with the real world | Done |
| 2 | No clear way back from a lesson | Back to lessons button | 3 User control and freedom | Done, `8f9ab6c` |
| 3 | Removing access is hidden | "Manage access", with a direct remove action | 6 Recognition rather than recall | Done, `a56a29c` |
| 4 | "Confirm" when removing a block | Button says "Delete" | 4 Consistency; 5 Error prevention | Done, `71d4415` |
| 5 | Cards blend into the background | More contrast, card-contrast setting | 8 Aesthetic and minimalist design | Done, `4410211` |
| 6 | How soon does the admin reply? | Expected reply time and "seen" status | 1 Visibility of system status | Done, `fea3376` |

**Decisions she confirmed:** the locked first run (error prevention), sidebar navigation (consistency), uncluttered pages (minimalist design), list and card views with a curriculum filter (flexibility), and sign-up by request and approval (supports the screening argument).

**Considered and not adopted:** cartoon imagery for children, which she raised and withdrew herself.

## Limits of this session

- It was a guided walkthrough, not a usability test: the project was explained first and most screens were narrated. No task success rates are claimed.
- Only some tasks were tried unaided. Finding a lesson was done alone; removing access needed a prompt; running a lesson, drafts and publishing were explained rather than attempted.
- Three suggestions made during the session ("more guided walkthroughs", "more hierarchy", "customisation based on the facilitator's personality") were the interviewer's words, not hers, and are not attributed to her.
- She is a friend, so her criticisms are the more reliable half of the feedback.
