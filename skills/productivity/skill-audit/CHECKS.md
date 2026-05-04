# Audit Checklist

Run every check. Mark each ✅ / ⚠️ / ❌ with a brief reason.

## 1. Description (frontmatter `description`)

- [ ] Present and non-empty
- [ ] Under 1024 characters
- [ ] Written in third person (not "I", "you", "we")
- [ ] First sentence states **what** the skill does
- [ ] Contains a "Use when…" clause naming concrete triggers (keywords, file types, contexts)
- [ ] Triggers are specific enough to distinguish from other skills (no vague "helps with X")
- [ ] No time-sensitive phrasing ("currently", "new", "as of 2024")

## 2. Frontmatter & structure

- [ ] Valid YAML frontmatter with at least `name` and `description`
- [ ] `name` matches the directory name
- [ ] SKILL.md exists at the skill root
- [ ] SKILL.md is under ~100 lines (warn at 100, fail at 200)
- [ ] H1 title present after frontmatter
- [ ] Sections use clear, scannable headings

## 3. Content quality

- [ ] At least one concrete example or template
- [ ] No time-sensitive info that will rot (specific dates, "latest version", model names that change)
- [ ] Terminology is consistent throughout (same noun for the same thing)
- [ ] Instructions are imperative and actionable, not aspirational
- [ ] No filler ("This skill helps you…", "Great for…")
- [ ] Links to bundled files use relative paths and resolve

## 4. File organization

- [ ] If SKILL.md > 100 lines, content is split into reference files
- [ ] Reference files are linked from SKILL.md (progressive disclosure, one level deep)
- [ ] No orphaned files (every bundled file is referenced from SKILL.md or another linked file)
- [ ] Scripts exist only for deterministic operations (validation, formatting, parsing)
- [ ] Scripts are documented in SKILL.md with invocation examples
- [ ] No duplicated content between SKILL.md and reference files

## 5. Process / workflow (if the skill defines one)

- [ ] Steps are numbered and ordered
- [ ] Each step has a clear exit condition
- [ ] Review/confirmation steps exist for destructive or user-visible actions
- [ ] Failure modes are addressed (what to do if a step fails)

## Severity guide

- ❌ **Fail**: missing required element, or content actively misleads (no description, broken frontmatter, dead links, time-sensitive claims)
- ⚠️ **Warn**: present but suboptimal (vague triggers, SKILL.md slightly over 100 lines, inconsistent terminology)
- ✅ **Pass**: meets the bar
