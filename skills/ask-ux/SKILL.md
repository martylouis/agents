---
name: ask-ux
description: Interviews users about their feature plans to generate comprehensive spec files. Explores and documents requirements, UI/UX decisions, concerns, and tradeoffs. Use when the user asks to "interview me about the plan", "generate a spec", "askux", or "UX interview".
---

# AskUX: Plan Interview Skill

Interview the user about their plan to generate a comprehensive spec file.

## Process

### 1. Detect Plan Files

Search for `.md` files in `./plans/` directory. If multiple plans exist, use AskUserQuestion tool to let the user select which plan to interview about.

### 2. Analyze the Plan

Read the selected plan file and identify:

- Core features and functionality
- Technical components mentioned
- Areas that need clarification
- Implicit assumptions that should be validated

Derive interview categories dynamically based on plan content rather than using fixed categories.

### 3. Conduct the Interview

Use the AskUserQuestion tool to interview the user. Follow an adaptive approach:

**Start with grouped questions** (2-4 related questions) to efficiently gather context:

- Group related aspects together
- Use multiSelect where appropriate

**Drill down with single questions** when:

- An answer reveals complexity needing exploration
- A topic requires focused attention
- Clarifying ambiguous responses

**Question Guidelines:**

- Ask NON-OBVIOUS questions - avoid things clearly answered in the plan
- Probe edge cases and error states
- Explore accessibility implications
- Question performance considerations
- Challenge assumptions
- Uncover hidden dependencies
- Explore user journey nuances

**Example non-obvious questions:**

- "What happens if the user does X mid-way through Y?"
- "How should this behave on slow connections?"
- "What's the recovery path if Z fails silently?"
- "How does this interact with existing feature W?"

**Continue interviewing until the user explicitly indicates completion** with phrases like:

- "done"
- "that's all"
- "complete"
- "let's wrap up"
- "finish"

### 4. Generate the Spec

When the interview is complete:

1. **Get username**: Run `git config user.name` to get the author name
2. **Get branch name**: Run `git branch --show-current` to get current branch
3. **Create spec file** at: `./specs/{username}/{branch-slug}.md`
   - Convert username to lowercase, replace spaces with hyphens
   - Use branch name as the filename (sanitized)

**Spec Structure:**

```markdown
# Spec: {Feature Name from Plan}

| Field  | Value               |
| ------ | ------------------- |
| Branch | {branch-name}       |
| Date   | {YYYY-MM-DD}        |
| Author | {username}          |
| Plan   | {path to plan file} |

## Overview

[Concise summary derived from plan and interview]

## Requirements

### Functional Requirements

[What the feature must do]

### Non-Functional Requirements

[Performance, security, accessibility, etc.]

## UI/UX Decisions

[Design choices, interactions, visual feedback, user flows]

## Concerns & Risks

[Identified issues with mitigation strategies]

## Tradeoffs

[Decisions made and their rationale - what was chosen and why]

## Edge Cases

[Specific scenarios discussed and their handling]

## Open Questions

[Any unresolved items for future consideration]
```

### 5. Confirmation

After writing the spec, inform the user of:

- The spec file location
- A brief summary of what was captured
- Any open questions that remain
