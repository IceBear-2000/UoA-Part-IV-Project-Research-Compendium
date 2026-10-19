# StudyBuddy — Design Tokens

Extracted from `studybuddy-mockup.html`, the source-of-truth reference. Use these exact values when building Tailwind config / CSS variables — don't reinterpret or "improve" them, the palette has already been through several rounds of direction with the client.

## Aesthetic direction
Warm paper canvas, soft pastel accents, no glow/neon, no heavy drop shadows. Cards read like sheets of paper resting on a desk. Calm, minimal, intuitive, premium — not playful/childish despite the education context.

## Colour palette

```css
--bg:        #F4F0E6;   /* warm paper canvas (page background) */
--bg-2:      #ECE6D8;   /* deeper paper (sidebar, rails, tag backgrounds) */
--surface:   #FCFAF4;   /* card surfaces, slightly warm white */
--ink:       #33302A;   /* primary text, soft warm near-black (never pure black) */
--muted:     #928B7C;   /* secondary text */
--line:      #E4DDCC;   /* default border / hairline divider */
--line-soft: #EDE7DA;

/* primary accent — used for primary buttons, active states, focus rings */
--clay:      #BE8264;
--clay-soft: #EDDFD4;   /* tinted background for active/selected state */
--clay-line: #DCC4B2;   /* border colour when something is in a clay-tinted state */

/* block-type colour coding — pastel, desaturated, used consistently everywhere a block type appears */
--sage:      #8FA585;   --sage-soft:  #E6EBE0;   /* Worksheet */
--blue:      #88A0B4;   --blue-soft:  #E3EAEF;   /* Workbook */
--gold:      #C9B173;   --gold-soft:  #F0E9D4;   /* Activity */
--rose:      #C0959F;   --rose-soft:  #F0E4E7;   /* Reading */
/* Video uses the clay/clay-soft pair above */
```

### Block type → colour mapping (keep consistent across builder, flow player, and anywhere blocks are listed)

| Block type | Background | Text/icon tint |
|---|---|---|
| Video | `--clay-soft` | `#8c5538` |
| Workbook | `--blue-soft` | `#54707f` |
| Activity | `--gold-soft` | `#8d7426` |
| Worksheet | `--sage-soft` | `#5f7355` |
| Reading | `--rose-soft` | `#946b76` |

## Shadows (paper, not UI-glow)

```css
--paper:    0 1px 0 rgba(51,48,42,.03), 0 1px 3px rgba(51,48,42,.05);
--paper-2:  0 1px 0 rgba(51,48,42,.03), 0 4px 10px rgba(51,48,42,.06);
```
No glow, no large soft-spread shadows, no coloured shadows. Hover states are border-colour or background changes, not lift/shadow increases — keep it flat and calm.

## Radius

- Cards / panels: `14px`
- Small elements (tags, pills, buttons): `10–11px`
- Inputs: `9–10px`
- Avatars: `50%` (circular)

## Typography

- Font stack: system UI sans (`-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif`)
- Headings: tight letter-spacing (`-0.02em` to `-0.03em`), weight 650–700
- Body: weight 400–500, `line-height: 1.5`
- Sentence case everywhere — no all-caps except small uppercase labels (section labels, badges) at `11–12.5px` with `letter-spacing: .04–.05em`

## Component behaviour notes

- **Active lesson-flow step:** filled clay circle (not outline), clay-soft tinted card background, clay-line border. This is the "selected" treatment — deliberately not a glow, just a clear filled/tinted state.
- **Completed step:** sage-filled circle with a check, sage-coloured connecting line.
- **Locked step:** ~45% opacity, not clickable, lock icon in place of step number.
- **Buttons:** primary = solid clay fill, white text. Secondary/ghost = white surface, border, no shadow. No large hover-lift; primary darkens slightly on hover, that's it.
- **Faint background texture:** a very subtle dot-grain pattern (~2.5% opacity) across the page background gives the "paper" feel. Optional but part of the intended aesthetic — recreate with a low-opacity radial-gradient dot pattern if feasible in CSS, otherwise skip rather than substitute something heavier.

## What to avoid

- No neon/saturated colours anywhere
- No glow effects (box-shadow with colour + blur to simulate glow)
- No glassmorphism / backdrop-blur
- No heavy card lift on hover
- No pure black (`#000`) or pure white (`#FFF`) for primary text/background — always the warm-tinted ink/paper values above
