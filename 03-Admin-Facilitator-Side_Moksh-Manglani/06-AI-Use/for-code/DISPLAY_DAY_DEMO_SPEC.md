# Display Day Demo: "Make a lesson in two minutes"

**Status:** spec for approval, not built yet.
**Event:** Part IV Display Day, Thursday 22 October 2026. **Spec written:** Tuesday 20 October 2026.
**Owner:** Moksh Manglani. **Builder:** Claude Code, working in this repository.

---

## 1. What this is

A public, no-login, phone-first page that a visitor reaches by scanning the QR code on the poster. In about two minutes they make a mini lesson (one piece of media plus a quick quiz), publish it into a **Display Day** class on the live platform, and receive a shareable **author badge**. Every badge also appears on a **Hall of Fame wall**: a dark, auto-scrolling screen for the stand that loops forever.

The point is to show, by doing, that building a StudyBuddy lesson is quick and easy, and to let visitors see what other people made.

### Goals

1. A first-time visitor finishes a lesson in about two minutes without any help.
2. The page is fun: jokes, memes and selfies are encouraged.
3. The real StudyBuddy data model is used, so the demo is not a mock-up.
4. Nothing a visitor does can reach real lessons, real accounts or real facilitators.
5. The stand can see activity live (the wall) and can remove anything inappropriate in one tap.

### Non-goals

- No accounts, no passwords and no sign-in for visitors.
- No AI features (decided).
- No link to May's tool yet (decided: after Display Day).
- No changes to the real admin or facilitator screens, apart from one admin page for Display Day.

---

## 2. Decisions already made

| Topic | Decision |
|---|---|
| Speed | Very quick: the lesson is one media item plus a quiz |
| Required to earn the badge | Name, at least 1 media item and a worksheet with at least 1 question |
| Media options | Take a photo or selfie, record a short clip, upload a meme, photo or clip from the gallery, paste a YouTube link |
| Quiz question types | Multiple choice, true or false, short answer, funny poll (no right answer) |
| Where lessons are saved | One **Display Day** class on the live platform, as **drafts** |
| About the visitor | Name required, email optional, photo or avatar optional |
| Reward | Author badge with photo or avatar and name, lesson title, "Display Day 22 Oct 2026", a fun rank and a lesson counter |
| After publishing | Badge, then the live Hall of Fame wall |
| Wall | "Hall of Fame": cool, dark, auto-scrolling in an infinite loop, showing badges |
| Making more | Encouraged. There is no visible limit, and the lesson counter shows next to the badge |
| Data | Everything is kept. At the end of lesson creation the visitor can tick **"Delete my personal data at the end of today"**. If they do, a second question appears: **"Would you like to delete your lesson too?"** |
| Deleting | One **Delete opted-out data** button, pressed by Moksh on the evening of Display Day |
| AI | None |
| Look | Playful and bold on the phone; dark "stage" look for the wall |
| Phasing | Phase 1 first, then the rest in order |
| May's tool nav button | Leave until after Display Day |

---

## 3. Defaults I chose (please confirm or change)

These were not discussed, so I picked sensible defaults. Say if any are wrong.

1. **The opt-out lives on the final "Done" screen**, not at sign-up. It is stored against the *person*, and the latest answer wins. The "delete my lesson too" answer applies to **all** that person's lessons.
2. **The wall shows one card per person**, not one per lesson. Their card shows their latest lesson title and their lesson counter, and it jumps to the front with a "+1" flash when they publish another.
3. **A hidden safety net on volume.** There is no visible limit, but the server quietly refuses extreme behaviour (see section 12). A normal visitor never sees it.
4. **The email is never shown anywhere public.** The sign-up note says it is only used to contact them about the demo.
5. **Names on the wall are whatever the visitor typed.** The field is labelled "Name or nickname".
6. **The class is called "Display Day"** with one subject called "Mini lessons", using the default curriculum setting.
7. **Visitors view their lesson on a simple demo page**, not in the real facilitator walkthrough. That keeps the real walkthrough's security rules untouched.
8. **Lessons stay as drafts for ever.** "Published" on the demo only means "on the wall".
9. **Video clips are Phase 2.** The stand works without them.

---

## 4. The visitor journey (phone first)

Routes are public and sit outside `/admin` and `/facilitator`, so the existing middleware does not ask anyone to log in.

| Route | Purpose |
|---|---|
| `/demo` | Landing and the whole create flow (one page, several steps) |
| `/demo/lesson/[viewToken]` | A visitor's own finished lesson, viewed in a simple page |
| `/demo/wall` | The Hall of Fame wall, for a screen at the stand |

A progress bar across the top shows five steps: **You, Idea, Media, Quiz, Publish**. Buttons are at least 48 px tall, fixed to the bottom of the screen, and thumb reachable.

### Step 0: Landing

- Heading: **Hi, welcome to the StudyBuddy demo!**
- Text: *Make a mini lesson in about two minutes. Add a photo, a video or a meme, build a quick quiz, and earn your author badge.*
- Primary button: **Let's go**
- Small line under it: *Lessons made today: 37* (live count of published lessons)
- Link: **Hall of Fame** (opens the wall in the same tab)
- Footer note: *This is a public demo, not research. Nothing here is used in our reports.*
- If the visitor already has a saved author (cookie): skip to **Welcome back, Sam! You've made 2 lessons.** with a **Make another** button and a small **Not you?** link that clears the cookie.

### Step 1: You

| Field | Rules |
|---|---|
| Name or nickname | Required, 1 to 30 characters, trimmed, no control characters |
| Email | Optional, valid format if given, max 120 characters |
| Photo | Optional. Three ways: **Take a selfie** (camera), **Choose a photo**, or **Pick an avatar** (12 preset emoji-style avatars) |

- If no photo is given, an avatar is chosen automatically from the preset set (the name decides which, so the same name gets the same avatar).
- A photo is resized and compressed on the phone to at most 512 px, JPEG, before upload (about 60 KB).
- Consent line under the button (required, shown as a note, not a checkbox): *Your name and photo will appear on the Hall of Fame screen. Your email is only used to contact you about this demo and is never shown.*
- Button: **Next**

### Step 2: Idea

- One field: **What is your lesson about?** (required, 3 to 60 characters)
- Under it, tappable starter chips that fill the field. They scroll sideways:
  - How to make the perfect cup of tea
  - Why my cat is secretly the boss
  - Survive your first week at university
  - Teach a goldfish to count
  - The science of the best toastie
  - How to win at rock paper scissors
  - A beginner's guide to being a pigeon
  - Ten ways to avoid doing the dishes
  - Learn to dance in three steps
  - Guess the movie from emojis
  - Explain your degree to a five-year-old
  - The history of your favourite snack
- A **Surprise me** chip picks one at random.
- Button: **Next**. The lesson draft is created on the server at this point (this also starts the speed clock for the Speedrunner rank).

### Step 3: Media

Heading: **Add something to show.** The visitor must add at least one item and can add up to three.

Four large tiles:

| Tile | What it does | Phase |
|---|---|---|
| **Take a photo** | Opens the camera (`<input type="file" accept="image/*" capture="environment">`) | 1 |
| **Upload a meme or photo** | Opens the gallery for an image or GIF | 1 |
| **YouTube link** | Paste a link. It is checked against the same rules as the real video block (YouTube video or playlist links only) and shows a small preview | 1 |
| **Record a clip** and **Upload a clip** | Camera in video mode, or a clip from the gallery. Up to 20 seconds, up to 40 MB | 2 |

- Each added item shows a thumbnail with a caption field (optional, up to 80 characters) and a remove button.
- Images are resized on the phone to at most 1280 px on the long side, JPEG (GIFs are left as they are, up to 4 MB), so a typical photo is 200 to 400 KB.
- Upload shows a progress ring, retries automatically twice, and keeps the item in the list with a **Retry** button if it still fails.
- Button: **Next** (disabled until at least one media item is added and uploaded).

### Step 4: Quiz

Heading: **Add a quiz.** The visitor must add at least one question and can add up to ten.

Tap **Add a question**, then pick a type from four chips:

| Type | Fields | Stored as |
|---|---|---|
| **Multiple choice** | Question, 2 to 4 options, tap the circle beside the right answer | `mcq` with `correctIndex` |
| **True or false** | Question, tap **True** or **False** for the right answer | `mcq` with options `["True","False"]` |
| **Short answer** | Question, the answer a student should give | `short_answer` |
| **Funny poll** | Question, 2 to 4 options, no right answer | new type `poll` (see section 7) |

- Question text: up to 140 characters. Option text: up to 60 characters. Short answer: up to 80 characters.
- A new empty question is added with the keyboard open and the first field focused.
- **Duplicate** and **Delete** buttons on each question. No drag-and-drop (it is slow on phones).
- Quiz title is filled automatically from the lesson title ("Quiz: {title}").
- Button: **Next**

### Step 5: Publish

- A preview card shows the title, the media thumbnails and the question count.
- Button: **Publish my lesson**
- On publish the server marks the lesson as on the wall, works out the rank, increments the author's lesson counter and returns the badge details.

### Step 6: Done

- Confetti (pure CSS, switched off for reduced-motion users).
- The **author badge** is revealed with a flip animation, showing the lesson counter, for example **Lessons: 3**.
- Buttons, in order:
  1. **Make another lesson** (primary)
  2. **See the Hall of Fame**
  3. **Save my badge** (downloads a PNG; on iPhone it opens the image so it can be saved to Photos)
  4. **View my lesson** (links to `/demo/lesson/[viewToken]`)
- A small data section at the bottom:
  - Checkbox: **Delete my personal data at the end of today**
  - If ticked, a second question appears: **Would you like to delete your lesson too?** with **Yes** and **No**
  - The answers save as soon as they change. The latest answer wins.

### Returning visitors

If the cookie is present the sign-up step is skipped. The author's name, photo and counter carry over. The Done screen always shows the current counter.

---

## 5. How a demo lesson is stored in StudyBuddy

Each lesson is an ordinary `Lesson` in the **Display Day** class, subject **Mini lessons**, with `status = DRAFT`. Its blocks, in this order:

| Order | Block type | Content |
|---|---|---|
| 0 to n | `VIDEO` for a YouTube link | `{ url, durationSeconds: null }` |
| 0 to n | `READING` for a photo, meme or clip | `{ instructions: caption, filePath, fileName, mediaKind: "image" or "video" }` |
| last | `WORKSHEET` | `{ fileUrl: "", generatedByAI: false, title, studentInstructions, questions: [...] }` using the existing worksheet question shapes |

- No new block type and no change to the `BlockType` enum, so there is no risky change to existing lessons.
- Lesson fields: `name` is the title, `description` is "Made at Display Day by {name}" only if the visitor has not opted out, and `durationMinutes` is 5.
- The real facilitator walkthrough ignores these lessons (drafts are never shown to facilitators).

### Funny poll

The existing worksheet renderer supports `mcq`, `short_answer`, `long_answer` and `coloring`. Add one small type, `poll: { type: "poll", prompt, options }`, which renders as options with no right answer and no answer key. If the renderer meets an unknown type it must show the prompt only and never crash.

---

## 6. The author badge

A card, 1080 by 1350 px when saved, drawn on a `<canvas>` in the browser so no new library is needed.

| Element | Detail |
|---|---|
| Top band | StudyBuddy logo and **AUTHOR** |
| Centre | The visitor's photo or avatar in a circle with a gold ring |
| Name | Large, bold, shrinks to fit up to 30 characters |
| Rank | A pill under the name, e.g. **Speedrunner** |
| Lesson title | Up to two lines |
| Lesson counter | A coin or chip beside the badge: **Lessons: 3** |
| Footer | **Display Day, 22 Oct 2026** and the demo URL |

Colour changes with rank, so different ranks look different on the wall.

### Rank rules (first match wins)

| Order | Rank | Rule |
|---|---|---|
| 1 | **Speedrunner** | Published within 90 seconds of confirming the idea |
| 2 | **Quizmaster** | 5 or more questions |
| 3 | **Director** | Includes a recorded or uploaded video clip (Phase 2) |
| 4 | **Comedian** | Includes at least one funny poll |
| 5 | **Photographer** | Includes a photo or selfie |
| 6 | **Fresh Author** | Anything else |

The rank is worked out on the server at publish time. The speed clock uses server timestamps only.

---

## 7. The Hall of Fame wall (`/demo/wall`)

- Full-screen, dark "stage" look, landscape first, readable from several metres.
- **Two rows of badges scrolling in opposite directions**, looping forever (CSS animation, no scroll bars, no controls).
- Each card is a small version of the badge: avatar or photo, name, rank, lesson title and **Lessons: N**.
- A header shows **StudyBuddy Hall of Fame** and a live count of lessons made today.
- New or updated authors jump in at the front with a short glow and a **+1** flash, then join the loop.
- The wall asks the server every 10 seconds for the latest 80 authors. If the request fails it keeps showing what it has. If there are fewer than 8 cards, it repeats cards so the loop still looks full.
- Reduced motion: a slow fade carousel instead of scrolling.
- It shows only: name, photo or avatar, rank, latest lesson title and counter. **Never the email.**
- A small padlock icon, top corner, opens a hidden "fullscreen" helper (press `F` too).

---

## 8. The visitor's lesson page (`/demo/lesson/[viewToken]`)

A simple page, reachable only by an unguessable token (shown on the Done screen and in the badge image's QR line if added later):

- Title and author.
- The media shown inline (images, clips and the YouTube embed).
- The quiz, interactive: tap an answer and see right or wrong. Short answers show the model answer after a tap. Funny polls show a small "thanks for voting" (not stored).
- No sign-in and no editing.

---

## 9. The admin page (`/admin/display-day`)

Behind the existing admin guard: it must call `requireAdmin()` on the page and on **every** action, like the rest of the admin side. It is linked from the Display Day class page only; it does not need a nav item.

- Top counts: authors, lessons, opted-out authors, storage used.
- A list of lessons, newest first, with author name, title, time, rank and a thumbnail.
- Per row: **Hide from wall** or **Show on wall**, and **Delete lesson**.
- Per author: **Delete author** (removes their lessons and media too).
- **Delete opted-out data** (one button):
  1. Shows a confirmation with counts: *"4 people asked for their personal data to be deleted. 2 also asked for their lessons to be deleted."*
  2. On confirm, for every author who ticked the box: delete the email and photo file, change the name to **Anonymous** and use a neutral avatar.
  3. For those who also said yes to deleting lessons: delete all their lessons (blocks go with them) and their media files, and remove them from the wall.
  4. Shows a result summary. It logs counts only, never names.
- Must work on a phone.

---

## 10. Data model (one small, additive migration)

New tables only. There is **no change to existing tables**, so nothing existing can break.

```prisma
model DisplayDayAuthor {
  id                 String   @id @default(cuid())
  token              String   @unique        // random, lives in the visitor's cookie, never shown
  name               String
  email              String?
  photoPath          String?                  // private storage path
  avatarKey          String?                  // preset avatar when there is no photo
  deletePersonalData Boolean  @default(false)
  deleteLessons      Boolean  @default(false)
  ipHash             String?                  // salted daily hash, for rate limits only
  createdAt          DateTime @default(now())

  lessons DisplayDayLesson[]

  @@index([createdAt])
}

model DisplayDayLesson {
  id           String           @id @default(cuid())
  lessonId     String           @unique
  lesson       Lesson           @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  authorId     String
  author       DisplayDayAuthor @relation(fields: [authorId], references: [id], onDelete: Cascade)
  viewToken    String           @unique      // for /demo/lesson/[viewToken]
  rank         String?
  hidden       Boolean          @default(false)
  startedAt    DateTime         @default(now())
  publishedAt  DateTime?
  buildSeconds Int?

  @@index([authorId])
  @@index([publishedAt])
}
```

Prisma also needs a back-reference line `displayDay DisplayDayLesson?` on `Lesson`. That is a virtual relation field and adds **no column** to the `Lesson` table.

Deploying it: `npx prisma migrate dev --name add_display_day` locally, review the SQL (two `CREATE TABLE`, indexes and foreign keys only), then Moksh runs `npx prisma migrate deploy` against production.

---

## 11. Server actions, endpoints and storage

All visitor actions run on the server with the service role key, but each is narrowly scoped. None of them calls the admin actions, and none can read or change anything outside Display Day.

| Action or endpoint | What it does | Checks |
|---|---|---|
| `startAuthor(name, email, photoPath?, avatarKey?)` | Creates an author and sets the cookie | Length and format, honeypot, rate limit, `DISPLAY_DAY_ENABLED` |
| `createLessonDraft(title)` | Creates the lesson in the Display Day class | Author from cookie, title rules, rate limit |
| `requestUpload(kind, mime, size)` | Returns a signed upload URL for `display-day-media` | Author from cookie, kind and MIME allow-list, size cap, uploads per hour |
| `confirmUpload(path)` | Confirms the object exists and records it | Path must start with this author's folder |
| `addYoutube(lessonId, url)` | Adds a video block | Same YouTube check as the real video block |
| `saveQuiz(lessonId, questions)` | Writes the worksheet block | Types, counts, lengths, one correct answer for mcq |
| `publishLesson(lessonId)` | Marks it on the wall, sets rank and counter | Lesson belongs to author, has at least 1 media and 1 question |
| `setDataOptions(deletePersonalData, deleteLessons)` | Stores the opt-out | Author from cookie |
| `GET /api/display-day/wall` | Returns wall cards | Read-only, fixed fields, short cache |
| Admin: hide, delete, purge | Moderation | `requireAdmin()` on each |

**Rules that always hold**

- Every write checks the lesson's class is the Display Day class and that the lesson belongs to the author in the cookie.
- Status is always `DRAFT`. Only the listed block types are ever created.
- All text is length-limited on the server, and shown through React (escaped). Nothing from a visitor is ever rendered as HTML.
- File uploads **never pass through the app server**: Vercel limits request bodies to about 4.5 MB, so the phone uploads straight to storage with a signed URL, and the server then verifies the object.
- Signed read links are made on the server, for one hour, only for wall cards and lesson pages. Files are never public.
- The author cookie is `HttpOnly`, `Secure`, `SameSite=Lax`, valid for 7 days.

### Storage

- New **private** bucket `display-day-media`, separate from the real `block-resources` bucket.
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif` and, in Phase 2, `video/mp4`, `video/quicktime`, `video/webm`.
- Caps: images 4 MB after shrinking, videos 40 MB.
- Folder per author: `{authorId}/{uuid}.{ext}`.
- **Check the Supabase plan before Thursday.** Free plans have a 50 MB per-file limit and about 1 GB in total. Images are tiny, but 100 clips at 15 MB would be 1.5 GB. If storage is tight, Phase 2 keeps video optional and the admin page shows storage used.

---

## 12. Abuse protection and the kill switch

| Guard | Setting |
|---|---|
| Kill switch | `DISPLAY_DAY_ENABLED` environment variable. If not `"true"`, `/demo` shows *"The demo has finished. Thanks for coming!"*, all visitor actions refuse, and the wall stays viewable. |
| New authors | Max 80 per 10 minutes per network (venue Wi-Fi is one network), and 1,000 per day overall |
| Lessons | Max 30 per author per hour, 2,000 per day overall |
| Uploads | Max 40 per author per hour |
| Honeypot | A hidden form field. If filled, the request is dropped quietly |
| Sizes | Hard limits on text, files and counts, enforced on the server |
| Bad words | A short word list blocks obviously offensive names and titles with a friendly message. This is a filter, not moderation. The real safety net is Hide and Delete |
| Logging | Counts and error types only, never names, emails or content |

The network guard uses a salted daily hash of the visitor's IP address, stored only against the author. No raw IP address is stored.

---

## 13. Privacy and consent

Visitors are members of the public at a university event, not research participants.

- The page says it is a public demo, not research, and nothing is used in the reports.
- Name and photo are shown on the wall, and the visitor is told this before they continue. Email is optional and never shown.
- Default: everything is kept. A visitor can opt out on the Done screen (section 4), and Moksh deletes opted-out data on the evening of Display Day (section 9).
- Photos are processed on the phone and stored in a private bucket. They are only shown on the wall and on that visitor's own lesson page.
- The `ethics` page of the compendium should mention the demo in one line once it is built.

---

## 14. Resilience on venue Wi-Fi

- **Autosave:** every step is saved on the phone (`localStorage`) and the draft lesson is saved on the server as the visitor goes. A refresh or a dropped connection resumes where they were.
- **Small uploads:** images are shrunk before upload.
- **Retry:** failed uploads retry twice, then show a **Retry** button. A visitor can continue with other items while one retries.
- **Slow network banner:** if a request takes more than 8 seconds, a small notice says *"Slow connection, hang on."*
- **Phone support:** iOS Safari 16 and later, Chrome on Android 10 and later.

---

## 15. Accessibility and performance

- Contrast of text and buttons meets WCAG AA. Tap targets are at least 48 px.
- Every image and badge has alt text. Forms have labels. The wall is decorative only.
- Reduced motion is respected (no confetti, no scrolling).
- No new dependencies: confetti is CSS, the badge is drawn with `<canvas>`, and images are shrunk with `<canvas>`.
- First load of `/demo` should stay under about 150 KB of JavaScript.

---

## 16. Phases and schedule

### Phase 1 (must work on Thursday)

Landing, You, Idea, Media (photo, selfie, gallery image or GIF, YouTube), Quiz (four types), Publish, badge and PNG save, rank, lesson counter, Hall of Fame wall, visitor lesson page, admin page with Hide, Delete and **Delete opted-out data**, opt-out on the Done screen, rate limits, honeypot, kill switch.

### Phase 2 (add after Phase 1 is solid)

Record a clip and upload a clip, the Director rank, and the video playback on the lesson page.

### Schedule

| When | What |
|---|---|
| Tue 20 Oct (evening) | Spec approved. Migration written and reviewed. Moksh runs it. Storage bucket and class created |
| Wed 21 Oct | Build Phase 1. Moksh tries it on a phone. Fix |
| Wed 21 Oct (evening) | Phase 2 if Phase 1 is solid. Dress rehearsal with 3 to 5 people. Repoint the QR code. Wall on the real screen |
| Thu 22 Oct (morning) | Code freeze. Check the QR, the wall and the kill switch |
| Thu 22 Oct (evening) | Press **Delete opted-out data**. Decide what to do with the rest |

---

## 17. Setup steps for Moksh

1. Approve this spec (reply with any changes).
2. After the migration is written, review the SQL and run `npx prisma migrate deploy` against production.
3. Run the setup script (to be written): `npx tsx scripts/setup-display-day.ts`. It creates the Display Day class, the Mini lessons subject and the `display-day-media` bucket, and prints the class and subject ids.
4. Add these variables in Vercel (Production), then redeploy:
   - `DISPLAY_DAY_ENABLED=true`
   - `DISPLAY_DAY_CLASS_ID=...`
   - `DISPLAY_DAY_SUBJECT_ID=...`
   - `DISPLAY_DAY_IP_SALT=` a long random string
5. Repoint the poster QR code: open the poster in Canva, click the QR code, choose **Edit link**, and set it to `https://study-buddy-uoa-project.vercel.app/demo`. The short link is `https://www.canvaqr.com/RGU2gwvAbt`. If Canva will not let you edit that link, create a new QR code for the demo URL and swap it in the poster. **Scan it with a phone before printing.**
6. Open `https://study-buddy-uoa-project.vercel.app/demo/wall` on the stand's screen and press `F` for full screen.

---

## 18. Acceptance checklist

A tester with no help should be able to tick all of these on a real phone.

- [ ] Scanning the QR code opens the landing page without any login.
- [ ] A new visitor finishes name, idea, media and quiz in about two minutes.
- [ ] A photo, a selfie, a gallery image and a YouTube link each work as the media item.
- [ ] All four question types can be added, and a lesson cannot be published without 1 media item and 1 question.
- [ ] The badge shows the right name, photo or avatar, title, date, rank and lesson counter, and can be saved.
- [ ] Making another lesson increments the counter and skips sign-up.
- [ ] The new author appears on the wall within about 10 seconds and the wall loops without gaps.
- [ ] The visitor's lesson page shows their media and a working quiz.
- [ ] The opt-out question appears when the box is ticked, and the answers save.
- [ ] On the admin page, Hide removes a card from the wall, Delete removes a lesson, and **Delete opted-out data** does exactly what its confirmation says.
- [ ] The real platform is unaffected: Display Day lessons never appear to facilitators, and normal lesson creation and walkthroughs still work.
- [ ] Turning `DISPLAY_DAY_ENABLED` off stops creation and shows the "finished" message.
- [ ] Signed-out visitors cannot reach `/admin` or `/facilitator`, and cannot read other people's emails, files or lessons.
- [ ] A phone with a poor connection can resume after a dropped connection without losing work.

---

## 19. Risks and how they are handled

| Risk | Handling |
|---|---|
| Offensive content on a public wall | Hide and Delete from a phone, name and title word filter, kill switch |
| Slow or busy venue Wi-Fi | Small images, autosave, retries, Phase 2 video is optional |
| Storage fills up | Image shrinking, size caps, storage meter on the admin page, check the plan first |
| Someone floods the system | Per-network and per-author limits, daily caps, kill switch |
| Public page weakens existing security | Separate routes, separate bucket, new tables only, no admin actions reused, existing guards unchanged |
| Two days is short | Phase 1 is complete on its own, and Phase 2 is optional |
| Personal data held | Plain consent text, opt-out on the Done screen, one-button deletion, no raw IPs, no email on any public page |

---

## 20. Out of scope (later)

- Link to May's reading-comprehension tool in the StudyBuddy nav (after Display Day).
- AI worksheet generation for visitors.
- Visitor sign-in or editing a lesson after publishing.
- Turning Display Day lessons into real lessons for facilitators.
- Analytics beyond the simple counts above.

---

## 21. Notes for the builder

- Follow the existing code style. Use British spelling and **no em dashes** in any text a user can see.
- Do not weaken anything the report says holds: server-side checks on every admin action, request-first approval, the step-locked walkthrough computed on the server, signed file links (3,600 second expiry for the real bucket), no student data, Prisma pinned below 7, and Vercel functions in `syd1`.
- Build on a branch (`display-day-demo`). Do not push to `main` or deploy without Moksh saying so.
- Small, separate commits, one per feature. Run the build and lint before each push.
- Never write secrets into the repository. Read the salt and ids from environment variables.
- Keep the demo's UI components in `app/demo/` and its server code in `lib/display-day/` so it can be switched off or removed in one move.
