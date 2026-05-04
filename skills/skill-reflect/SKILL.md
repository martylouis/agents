---
name: skill-reflect
description: >
  Analyze the current conversation for corrections, approvals, and reusable patterns, then propose
  targeted edits to the SKILL.md files of skills that were used this session. Use this skill when
  the user says "/skill-reflect", asks to "update the skill", says "next time you [do X]", mentions
  a specific skill name and a correction to it, or reports "I told you this last time" (a signal
  that a prior lesson never got captured). Do NOT trigger on casual uses of "reflect" in regular
  conversation ("let me reflect on this") — only when the user signals they want a skill improved.
  Proposes edits for review before writing; does not touch git. Distinct from the auto-memory
  system: memory captures user/project/feedback context, skill-reflect edits skill workflow guidance.
---

# Skill Reflect

Turn in-session feedback into durable skill improvements. The goal is **correct once, not every session** — when a correction belongs in a skill's workflow, it belongs in that SKILL.md so the next conversation starts already knowing.

## Scope: which skills can reflect edit?

Editable: `~/.claude/skills/` and `<cwd>/.claude/skills/`. Never edit `~/.claude/plugins/cache/` — overwritten on plugin update.

In-scope per run: a skill named in the invocation (`/skill-reflect wiki-ingest`) overrides everything; otherwise, only skills the transcript actually invoked (via `Skill` tool or `/<skill-name>`). Zero skills used and none named → report "nothing to reflect on" and exit.

## Split with auto-memory — don't cross the streams

This skill edits **skill workflow guidance** (instructions Claude follows while executing a specific skill). The auto-memory system (`~/.claude/projects/.../memory/`) captures **context about the user, project, and cross-cutting feedback**. They must not overlap.

- "When ingesting meeting transcripts, strip MacWhisper speaker labels before summarizing" → **reflect** (workflow rule for `wiki-ingest`)
- "User prefers terse responses, no trailing summaries" → **auto-memory** (cross-cutting feedback)
- "Use shadcn's Card, not a raw div, when building dashboards" → **reflect** (guidance for `frontend-design`)
- "User's team uses GitLab, not GitHub" → **auto-memory** (project context)

Rule of thumb: if the signal is tied to one skill's *how-to*, reflect. If it applies across skills or is about *who the user is*, auto-memory. If genuinely cross-cutting, prefer auto-memory.

## The workflow

### 1. Scan the conversation for signals

- **Corrections** — "no", "don't", "actually", "stop doing X". Capture what Claude did, what the user wanted, and *why*.
- **Approvals** — "yes exactly", "keep doing that", or silent acceptance of a non-obvious choice. Equally important — skills that only learn from mistakes drift toward over-caution.
- **Repeated patterns** — same multi-step thing done twice this session. Candidate for a skill-level shortcut.
- **"I told you this before"** — earlier lesson didn't get captured.

Route each signal to the specific in-scope skill it belongs to, not a generic one.

### 2. Classify by confidence

- **High** — user explicitly stated a rule: "never do X", "always Y", "stop doing Z". Unambiguous.
- **Medium** — user accepted or reinforced an approach without stating it as a rule. Capture as guidance, not commandment.
- **Low** — patterns you noticed that *might* matter. Surface as observations, don't draft edits.

### 3. Draft edits with discipline

For each high/medium signal, draft a specific edit. Before writing anything:

**Conflict check.** Re-read the target SKILL.md. If the new rule contradicts existing text, flag it — don't silently append a rule that argues with itself.

**Overfit check.** The *why* must describe a pattern, not a single instance. "Because in this conversation I forgot to..." is a red flag — rewrite to describe the general class of problem. If you can't generalize, the signal probably isn't a rule.

**Cap.** No more than 3 edits to any single skill per run. If you have more, pick the most impactful and let the user know the rest were dropped.

Each proposed edit specifies:

- **Which skill file** (absolute path)
- **Where** (section heading or nearby anchor)
- **What** (exact new text)
- **Why** (one-line *general* reason — this is the most important field; a rule without a defensible reason becomes cargo-cult and resists later revision)

### 4. Review with the user

Present proposals grouped by confidence tier; low-confidence signals go in a separate observations list without drafted edits. Do NOT use `AskUserQuestion` — plain prose with "let me know which to apply" leaves room for accept-all, accept-some, revise, or reject.

### 5. Apply

Use `Edit` on SKILL.md files. Prefer appending to an existing relevant section over creating new ones — skills bristling with parallel "important rules" sections rot fast. If no natural home exists, append to `## Learned conventions` near the bottom as short bullets. Do not stage, commit, or push.

### 6. Report

One short summary — what changed, what was declined.

## Writing style for the edits themselves

Match skill-creator tone: imperative ("Use X when Y"), no ALL-CAPS shouting, always include the *why*, terse (one line beats a paragraph), generalized (encode the pattern, not the instance).

Good: `When ingesting meeting transcripts, strip MacWhisper speaker labels before summarizing — the labels are noisy and summaries read better without them.`

Bad (overfit, no why, rigid): `NEVER include "Speaker 1" or "Speaker 2" in summaries. ALWAYS remove first.`

## What not to capture

- **Ephemeral context** — "we're debugging issue #123 right now". Belongs in the conversation, not a skill.
- **Things already in the skill** — re-read the target SKILL.md before proposing; duplicates are noise.
- **Personal preferences** — route to auto-memory.
- **One-off workarounds** — if the user agreed the fix was temporary or situational, don't encode it as a rule.
- **Single-instance reasons** — if you can't generalize the *why*, the signal isn't ready to be a rule.
