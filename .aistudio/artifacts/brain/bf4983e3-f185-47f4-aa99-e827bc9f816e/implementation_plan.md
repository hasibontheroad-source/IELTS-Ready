# Professional Redesign & Prestige Cambridge Visual Overhaul

Elevate IELTS Ready into a prestigious, world-class Cambridge Academic preparation platform using an authentic Cambridge Royal Navy and Warm Gold collegiate palette, distinctive four-skill color coding, high-fidelity architectural campus imagery, and an asymmetric Bento capability showcase.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions have been confirmed:
> - **Prestige Color Foundation**: **Cambridge Royal Navy & Warm Gold** — Deep royal midnight canvas (`#040a17`, `#0a1428`), structural slate panels (`#0e1a32`, `#142244`), hairline gold borders (`rgba(245, 158, 11, 0.25)`), and warm burnished gold accents (`#f59e0b`, `#fbbf24`).
> - **Distinctive 4-Skill Color System**:
>   - **Listening**: Royal Azure / Sapphire Blue (`#2563eb` · `#38bdf8`)
>   - **Reading**: Emerald Jade (`#059669` · `#34d399`)
>   - **Writing**: Amber Gold (`#d97706` · `#fbbf24`)
>   - **Speaking**: Rose Crimson (`#e11d48` · `#fb7185`)
> - **Imagery & Layout Architecture**: High-fidelity $16:9$ Cambridge architectural hero banner generated via `generate_image`, paired with an asymmetric 4-module Bento grid featuring genuine exam metrics, direct practice entry points, and live readiness indicators.
> - **Top Bar Contract Compliance**: Clean 3-zone header (Brand Wordmark — 5 concise links — 1 primary action button), zero decorative pill sandwich badges.

---

## 1. Overview & Core Concept

- **What It Does**: Provides candidates with an authentic, prestigious British academic testing environment. Every section—from the homepage hero and test selector to the Writing Evaluator and Speaking Studio—reflects official Cambridge English and British Council exam standards.
- **Visual Impact**: Replaces flat dark surfaces with deep royal navy gradients, warm collegiate gold micro-accents, authentic photography of Cambridge historical architecture, and clear visual hierarchy across the 4 exam skills.
- **Target Audience**: Ambitious academic candidates and professionals aiming for Band 7.5 to 9.0 who expect a distinguished, authoritative examination interface.

---

## 2. User Experience & Visual Design

### 1. Header & Navigation (Strict Top Bar Contract)
- **Zone 1 (Brand)**: Single wordmark element `IELTS Ready` in Plus Jakarta Sans 800 with a subtle gold academic crest icon.
- **Zone 2 (Links)**: 5 concise single-line links (`Mock Tests`, `Writing Lab`, `Speaking Studio`, `Band Analytics`, `Exam Intel`) with gold hover underlines.
- **Zone 3 (Action)**: Single high-intent CTA button: `"Start Cambridge Test"`.

### 2. High-Fidelity Hero Section
- **Dominant Visual**: Full-width cinematic $16:9$ asset (`cambridge_campus_hero`) depicting historic Cambridge university architecture at twilight with warm interior library illumination.
- **Headline**: High-contrast typography in Plus Jakarta Sans (`clamp(2.25rem, 4vw, 3.5rem)`): *"Official Cambridge Academic Mock Tests & Certified Band Analytics"*.
- **Kicker & Proof Strip**: Unboxed text with typographic separators (`·`): `Books 1–21 Complete Archives · 84 Official Tests · Certified 9-Band AI Scoring`.
- **Primary Actions**: Dual clear actions: `"Begin Full Mock Test"` and `"Launch Speaking Studio"`.

### 3. Asymmetric Bento Capability Grid (The 4 Skills)
- **Listening Card (Sapphire Blue)**: 40 questions per test, Sections 1–4 audio simulations, auto-grading with Cambridge conversion tables.
- **Reading Card (Emerald Jade)**: Passages 1–3, academic scientific texts, split-view passage reader with question navigation.
- **Writing Lab Card (Amber Gold)**: Task 1 visual charts & Task 2 essays, instant scoring with Thinking Mode, 1:2 weighted official scoring.
- **Speaking Studio Card (Rose Crimson)**: Real-time live speech word generation, dynamic soundwave canvas, 1-min prep timer, and official 4-criteria part score modal.

### 4. Color Palette & Typographic System
- **60% Neutral Canvas**: Royal Navy (`#040a17`), Midnight Obsidian (`#020617`).
- **30% Structural Panels**: Deep Navy Slate (`#0a1428`, `#0f1f3d`), hairline borders (`#1e2e4e`).
- **10% Accent Highlights**: Warm Gold (`#f59e0b`, `#fbbf24`) and four skill semantic accents (Blue, Emerald, Amber, Rose).
- **Typography**: Plus Jakarta Sans for refined display headlines and UI controls; JetBrains Mono for tabular numbers and scores; Source Serif / DM Sans for reading passages and essays.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: High-Fidelity Batch Generated Images vs Generic Unsplash Links
- **Chosen Approach**: Generate authentic, domain-tailored visual assets using `generate_image` in a single parallel batch:
  1. `cambridge_campus_hero`: Historical collegiate architecture along the River Cam (16:9).
  2. `cambridge_exam_hall`: Grand vaulted academic testing hall (4:3).
  3. `candidate_speaking_lab`: Candidate in modern acoustic testing booth with broadcast microphone (4:3).
  4. `candidate_writing_desk`: Traditional academic desk with fountain pen, charts, and Cambridge booklet (4:3).
- **Why**: Protects against broken image links in hermetic sandboxes and delivers consistent, bespoke collegiate prestige.

### Decision 2: Distinctive 4-Skill Colors vs Monochromatic Palette
- **Chosen Approach**: Dedicated semantic colors for Listening (Blue), Reading (Emerald), Writing (Amber), and Speaking (Rose).
- **Why**: Reduces cognitive load during multi-part mock exams, allowing candidates to instinctively recognize which exam module they are navigating.

---

## 4. Technical Architecture & Component Structure *(Technical Reference)*

### System Layout & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                               Navbar.tsx                               │
│  [IELTS Ready ⚜]    [Tests · Writing · Speaking · Analytics · Intel]   │
│                     [Start Cambridge Test CTA]                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                               App.tsx                                  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                Prestige Cambridge Hero Banner                    │  │
│  │       (cambridge_campus_hero · Headline · Proof Points)          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Asymmetric 4-Skill Bento Grid Showcase              │  │
│  │   [Listening (Blue)]      [Reading (Emerald)]                    │  │
│  │   [Writing Lab (Amber)]   [Speaking Studio (Rose)]               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               Active Module View (Dynamic Tab Container)         │  │
│  │   CambridgeMockHub / WritingEvaluator / SpeakingStudio / etc.    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Planned Visual Assets to Generate (Single Parallel Batch)

1. `cambridge_campus_hero` (16:9): "Majestic architectural exterior of Cambridge University King's College chapel and collegiate stone arches at golden hour twilight, glowing interior library windows, regal English academic prestige, high resolution photography."
2. `cambridge_exam_hall` (4:3): "Atmospheric interior of a grand historic British university examination hall with organized wooden student desks, soft directional morning light through arched gothic windows, silent focused examination atmosphere."
3. `candidate_speaking_lab` (4:3): "Professional language testing studio with modern acoustic panels, studio microphone on articulated arm, headphones, and warm desk lamp, broadcast quality."
4. `candidate_writing_desk` (4:3): "Top-angle still life of an academic study desk with an open Cambridge test booklet, classic brass desk lamp, fountain pen, and quantitative statistical charts, quiet scholarly aesthetic."
