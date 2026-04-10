# How to work with AI on this project

Practical guide based on many sessions building ECHOS together.

---

## The core problem

AI assistants have a **context window** — a limit on how much text they can hold in memory at once. In a long session, early parts of the conversation get compressed or forgotten. This leads to:
- AI forgetting what files it already created
- Repeating work that was done before
- Giving inconsistent answers
- Needing to be reminded of the project structure constantly

This guide helps you avoid all of that.

---

## 1. Start every new session with a briefing

Don't assume the AI remembers anything. Open each session with:

```
Project: ECHOS (JS browser version + Godot 4 port)
Location: ~/Yandex.Disk.../ECHO/
Active folder: echos_10_04_26/ (JS) or echos/ (Godot)
Last thing we did: [one sentence]
Current goal: [what you want today]
```

The more specific, the less backtracking.

---

## 2. One task per session

Don't combine goals like "fix the fire animation AND add a new world AND deploy to GitHub". Each task compounds context usage. Better:

- Session 1: fix fire animation
- Session 2: add new world
- Session 3: deploy

If you need to do multiple things, state them upfront as a numbered list so the AI can plan in order.

---

## 3. Refer to files by exact path

Bad: *"fix the player script"*
Good: *"fix worlds/world_01.js → _drawPlayer(), the lean is too strong"*

The AI can read and edit files directly but needs exact locations. When you know which file and which function — say so immediately.

---

## 4. Ask for explanations before changes

If the AI is about to do something complex, ask it to explain the plan first:

*"Before you start — describe what you're going to change and why"*

This catches misunderstandings before 100 lines of wrong code are written.

---

## 5. Keep a DEVLOG

Maintain a `DEVLOG.md` in the project root. After each session, paste in:
- What was done
- What was broken and how it was fixed
- What was NOT finished

Then at the start of the next session: *"Read DEVLOG.md first"*.

---

## 6. When the AI makes a mistake

Don't say *"this is wrong, do it again"* — say specifically what's wrong:

Bad: *"it doesn't work"*
Good: *"the player leans 90 degrees when moving, the lean multiplier is too high, it's in `_drawPlayer()` around line 45"*

The more specific you are, the faster and more accurately it gets fixed.

---

## 7. Context limit warning signs

Watch for these — they mean the AI is losing track:

- Asks you for information it already has
- Creates a file that already exists
- Contradicts something it said earlier
- Gives a vague non-answer to a specific question

When this happens: **start a new session** and brief it fresh. Don't try to "remind" it within the same session — you're just using up more context.

---

## 8. Use "Continue from where you left off"

If the session was interrupted, this phrase usually works as a signal to resume. But always verify — ask the AI to confirm what it thinks the current state is before it starts working.

---

## 9. Read before write

Always ask the AI to read a file before editing it:

*"Read worlds/world_01.js first, then fix the _drawFire function"*

This prevents it from hallucinating file contents and making changes to code that doesn't match what's actually there.

---

## 10. Separate concerns

This project has two independent parts:

| | JS version | Godot version |
|---|---|---|
| Folder | `echos_10_04_26/` | `echos/` |
| Language | JavaScript | GDScript |
| Repo | `echos-js` | `echos-godot` |

When working on one, don't mix in the other. State clearly at the start of the session which version you're working on.

---

## Useful session starters

**To fix a bug:**
> "We're working on echos_10_04_26/worlds/world_01.js. The fire animation [describe problem]. Read the file first, then suggest a fix."

**To add a feature:**
> "Working on JS version (echos_10_04_26). I want to add [feature]. Which file should it go in, and roughly what's the approach?"

**To deploy:**
> "Deploy the JS version to GitHub Pages on the echos-js repo. Token: [paste token]. The files are in echos_10_04_26/."

**To understand the code:**
> "Read worlds/world_01.js and explain how [specific part] works."

---

## Project quick reference

```
echos_10_04_26/     ← JS browser game (this repo)
echos/              ← Godot 4 port
echos_tutorial/     ← Godot interactive tutorial (Godot Tours)
echos_backup_*/     ← dated backups, don't touch
```

GitHub:
- `DaniilKoronkevich/echos-js`    → JS version
- `DaniilKoronkevich/echos-godot` → Godot version
