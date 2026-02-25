---
name: agents-md
description: Manage AGENTS.md and CLAUDE.md files - migrate, create symlinks, refactor content, and ensure consistency across the project
---

# AGENTS.md Management Skill

This skill manages the relationship between AGENTS.md (the canonical file) and CLAUDE.md (backwards-compatible symlink).

## Background

- `AGENTS.md` is the new standard for agent instructions
- `CLAUDE.md` is maintained as a symlink for backwards compatibility
- Both names should work, but AGENTS.md is the source of truth

## Commands

### `/agents-md migrate`

Convert existing CLAUDE.md files to AGENTS.md with symlinks:

1. Find all CLAUDE.md files (that are not already symlinks)
2. Rename each to AGENTS.md
3. Create CLAUDE.md symlink pointing to AGENTS.md
4. Stage changes in git

### `/agents-md ensure-symlinks`

Ensure all AGENTS.md files have corresponding CLAUDE.md symlinks:

1. Find all AGENTS.md files in the project
2. Check if CLAUDE.md exists in each directory
3. Create missing symlinks
4. Report results

### `/agents-md status`

Show current state of all AGENTS.md and CLAUDE.md files:

1. List all AGENTS.md files
2. List all CLAUDE.md files (noting which are symlinks)
3. Flag any inconsistencies

### `/agents-md refactor [path]`

Refactor an AGENTS.md file to follow progressive disclosure principles. If no path is provided, refactors the root AGENTS.md.

**Steps:**

1. **Find contradictions**: Identify any instructions that conflict with each other. For each contradiction, ask which version to keep.

2. **Identify the essentials**: Extract only what belongs in the root AGENTS.md:
   - One-sentence project description
   - Package manager (if not npm)
   - Non-standard build/typecheck commands
   - Anything truly relevant to every single task

3. **Group the rest**: Organize remaining instructions into logical categories (e.g., TypeScript conventions, testing patterns, API design, Git workflow). For each group, create a separate markdown file in `.claude/rules/`.

4. **Flag for deletion**: Identify any instructions that are:
   - Redundant (the agent already knows this)
   - Too vague to be actionable
   - Overly obvious (like "write clean code")

**Important:** This command does not rename files. Use `/agents-md migrate` to convert CLAUDE.md to AGENTS.md.

## Scripts

The skill includes shell scripts for common operations:

- `.claude/skills/agents-md/scripts/ensure-symlinks.sh` - Create missing symlinks
- `.claude/skills/agents-md/scripts/migrate.sh` - Migrate CLAUDE.md to AGENTS.md
- `.claude/skills/agents-md/scripts/status.sh` - Show current state

## Workflow

### Migration (CLAUDE.md → AGENTS.md)

```bash
# Run the migration script
./.claude/skills/agents-md/scripts/migrate.sh

# Or manually for a single file:
mv CLAUDE.md AGENTS.md
ln -s AGENTS.md CLAUDE.md
```

### Ensure Symlinks

```bash
# Run the ensure script
./.claude/skills/agents-md/scripts/ensure-symlinks.sh

# Or manually for a single directory:
cd path/to/dir
ln -s AGENTS.md CLAUDE.md
```

### Check Status

```bash
./.claude/skills/agents-md/scripts/status.sh
```

## Conflict Resolution

If both AGENTS.md and CLAUDE.md exist as separate files:

1. Compare contents with `diff AGENTS.md CLAUDE.md`
2. If identical: Remove CLAUDE.md and create symlink
3. If different: Manually merge, keep AGENTS.md as source, create symlink

## Success Criteria

- No standalone CLAUDE.md files (only symlinks)
- Every AGENTS.md has a CLAUDE.md symlink
- All symlinks point correctly
