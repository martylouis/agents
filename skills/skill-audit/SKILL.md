---
name: skill-audit
description: Audit an existing agent skill for description quality, structure, content quality, and file organization, then report findings and propose fixes. Use when user wants to audit, review, check, lint, or improve an existing skill — typically invoked as `/skill-audit <path>`.
---

# Skill Audit

## Process

1. **Locate the skill** — resolve the target path:
   - Argument given: use it directly (file or directory).
   - No argument: ask for a path or skill name. Do NOT scan all skills unless explicitly requested.
   - If path is a directory, the entrypoint is `SKILL.md` inside it.

2. **Read everything** — `SKILL.md` plus any sibling `.md` files and `scripts/`. Note line counts.

3. **Run the deterministic lint** first: `python3 scripts/lint.py <skill-path>` (relative to this skill's directory). It returns JSON covering frontmatter, line count, description shape, dead links, orphaned files, and time-sensitive phrases. Use its results as the baseline for the report.

4. **Run the qualitative checks** in [CHECKS.md](CHECKS.md) — judgment calls the script can't make (terminology consistency, example concreteness, trigger specificity). Score each as ✅ pass / ⚠️ warn / ❌ fail with a one-line reason.

5. **Report findings** — print a compact report (see template below).

6. **Propose fixes** — for each ❌/⚠️, propose a concrete edit. Group trivial fixes (typos, frontmatter) separately from substantive ones (restructuring, splitting files).

7. **Apply on confirmation** — wait for user approval, then apply edits with the Edit/Write tools. Don't auto-apply.

## Report template

```
# Skill Audit: <skill-name>

**Path**: <path>
**SKILL.md**: <N> lines
**Bundled files**: <list or "none">

## Description
<✅/⚠️/❌> <verdict>

## Structure
<✅/⚠️/❌> <verdict>

## Content quality
<✅/⚠️/❌> <verdict>

## File organization
<✅/⚠️/❌> <verdict>

## Modularity
<✅/⚠️/❌> <verdict>
Suggested split: <only if ❌, anchored to H2s>

## Proposed fixes
1. <fix> — <file:line if applicable>
2. ...
```

## What to check

See [CHECKS.md](CHECKS.md) for the full checklist. Summary:

- **Description**: third person, has "Use when…", under 1024 chars, distinguishing triggers
- **Structure**: valid frontmatter (`name`, `description`), SKILL.md under ~100 lines, progressive disclosure via linked files
- **Content**: concrete examples, no time-sensitive info (e.g. dated phrases like "as of <year>"), consistent terminology, no dead links
- **Organization**: split when >100 lines or distinct domains; scripts only for deterministic ops
- **Modularity**: cohesion test — all workflows on one domain object? Lint flags ≥5 workflow H2s or >500 total .md LOC as suspect; auditor decides

## Notes

- Trigger accuracy is out of scope — this skill is invoked explicitly.
- If the skill being audited is `write-a-skill` or `skill-audit` itself, audit it the same way; don't skip.
- Don't rewrite the skill wholesale unless the user asks — prefer minimal targeted edits.
