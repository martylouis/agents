---
name: ux-review
description: This skill assembles a team of UX experts to analyze interfaces
  for implied usability issues. Use when reviewing mockups, screenshots,
  feature descriptions, user flows, or frontend code. Triggers on "UX review",
  "usability audit", "UX analysis", "analyze UX", or "find UX issues".
---

# UX Expert Team

Assemble a panel of 10 specialized UX experts to analyze interfaces and identify **implied** UX issues—problems that aren't obvious bugs but silently degrade user experience.

## Quick Start

Provide any of these inputs:

- **Screenshot/mockup**: Path to an image file
- **Code path**: Frontend view, template, or component file
- **Feature description**: Text describing the feature to review
- **URL**: Live page to capture and analyze (uses agent-browser)

## The Expert Team

| Expert                      | Focus Area              | Catches Issues Like                                                |
| --------------------------- | ----------------------- | ------------------------------------------------------------------ |
| **Heuristics Expert**       | Nielsen's 10 principles | No undo, hidden system status, inconsistent actions                |
| **Accessibility Expert**    | WCAG, assistive tech    | Color-only indicators, missing labels, focus traps                 |
| **Cognitive Load Analyst**  | Mental models, memory   | Too many choices, deep navigation, unclear hierarchy               |
| **Emotional Design Expert** | Delight, frustration    | Cold interactions, missing celebrations, anxiety triggers          |
| **Mobile UX Expert**        | Touch, responsive       | Small tap targets, thumb zone violations, gesture conflicts        |
| **Error Recovery Expert**   | Messages, recovery      | Generic errors, data loss on failure, no recovery path             |
| **Onboarding Expert**       | First-time experience   | Overwhelming features, empty states, no progressive disclosure     |
| **Microinteraction Expert** | Feedback, states        | Silent failures, missing hover states, no loading indicators       |
| **Information Architect**   | Navigation, findability | Poor labeling, deep burial, broken scent trails, orphaned content  |
| **Usability Tester**        | Task completion, flows  | Friction points, dead ends, testable hypotheses, learnability gaps |

## Analysis Process

### Step 1: Gather Input Material

Determine input type and prepare for analysis:

1. **Image file**: Read the image directly
2. **Code path**: Read the file(s) and understand the UI structure
3. **Feature description**: Use the text as-is
4. **URL**: Use agent-browser to capture a screenshot

### Step 2: Launch Expert Analysis

Launch all 10 experts in parallel using the Task tool. Each expert receives the same input and analyzes through their specialized lens.

### Step 3: Synthesize Findings

After all experts complete:

1. Collect all findings
2. Deduplicate overlapping issues (keep the most specific)
3. Prioritize by severity (P1 > P2 > P3)
4. Group by location/component when possible

### Step 4: Deliver Report

Present the structured report using the output format below, then save it to a file.

**File Output**: Always save the report to `.claude/docs/reviews/ux/{YYYY-MM-DD}-{HHMM}-{subject}.md`

- Create the directory structure if it doesn't exist
- Use the current timestamp for the filename (e.g., `2026-01-28-143052.md`)
- Include YAML frontmatter with metadata about what was analyzed

## Output Format

The report includes YAML frontmatter when saved to file:

```yaml
---
title: UX Review - {subject}
date: { YYYY-MM-DD HH:MM:SS }
input_type: { screenshot|code|description|url }
input_source: { file path, URL, or "feature description" }
experts: 10
critical_count: { number }
important_count: { number }
minor_count: { number }
---
```

### Executive Summary

Brief overview: what was analyzed, critical issue count, overall UX health assessment.

### Critical Issues (P1)

Issues that prevent task completion or cause significant frustration.

| #   | Issue | Expert | Location | Impact | Recommendation | Effort       |
| --- | ----- | ------ | -------- | ------ | -------------- | ------------ |
| 1   | ...   | ...    | ...      | ...    | ...            | Low/Med/High |

### Important Issues (P2)

Issues that degrade experience but don't block users.

| #   | Issue | Expert | Location | Impact | Recommendation | Effort       |
| --- | ----- | ------ | -------- | ------ | -------------- | ------------ |
| 1   | ...   | ...    | ...      | ...    | ...            | Low/Med/High |

### Minor Issues (P3)

Polish issues and missed opportunities for delight.

| #   | Issue | Expert | Location | Impact | Recommendation | Effort       |
| --- | ----- | ------ | -------- | ------ | -------------- | ------------ |
| 1   | ...   | ...    | ...      | ...    | ...            | Low/Med/High |

### Expert Deep Dives

Optionally include detailed analysis from specific experts when their findings warrant explanation.

## Severity Definitions

- **P1 (Critical)**: Blocks task completion, causes data loss, or creates significant frustration
- **P2 (Important)**: Degrades experience, slows users down, or causes confusion
- **P3 (Minor)**: Polish opportunities, missing delight, or minor friction

## Effort Estimates

- **Low**: CSS/copy change, single component update
- **Medium**: Component refactor, new state handling
- **High**: Architecture change, new feature development

## Invocation Workflow

When this skill is triggered:

1. Parse the input to determine type (image, code, description, URL)

2. If URL provided, first capture with agent-browser skill to get a screenshot

3. Launch all 10 experts in parallel using Task tool with these subagent_types:
   - ux-review:heuristics-expert
   - ux-review:accessibility-expert
   - ux-review:cognitive-load-expert
   - ux-review:emotional-design-expert
   - ux-review:mobile-ux-expert
   - ux-review:error-recovery-expert
   - ux-review:onboarding-expert
   - ux-review:microinteraction-expert
   - ux-review:information-architect
   - ux-review:usability-tester

4. Wait for all experts to complete

5. Synthesize and present the report

6. Save the report to `.claude/docs/reviews/ux/{YYYY-MM-DD}-{HHMM}.md`:
   - Create directory with `mkdir -p .claude/docs/reviews/ux`
   - Generate filename from current timestamp
   - Write report with YAML frontmatter
   - Confirm file path to user

## Examples

### Example 1: Screenshot Analysis

User: Analyze this checkout page for UX issues [attaches screenshot]

The skill reads the image and launches all 10 experts. Each expert analyzes the screenshot through their lens and returns findings. The orchestrator synthesizes into a prioritized report.

### Example 2: Code Review

User: /ux-review app/views/users/profile.html.erb

The skill reads the view template, understands the UI structure, and has each expert analyze for implied issues in their domain.

### Example 3: Feature Description

User: Review this feature for UX issues: "Users can bulk-select emails and apply actions like archive, delete, or label. Selected count shows in the toolbar."

Each expert analyzes the description for potential issues: cognitive load from too many options, error recovery if bulk delete fails, accessibility of selection mechanism, etc.

### Example 4: Live URL

User: /ux-review https://example.com/pricing

The skill first uses agent-browser to capture the page, then runs all experts against the captured screenshot.
