---
name: ux-orca
description: Run the ORCA process (Objects, Relationships, CTAs, Attributes) to synthesize research into structured information architecture before screen design. Use this skill whenever the user wants to do object-oriented UX, run ORCA, identify objects in a product, map relationships between entities, create an object map, do noun foraging, write OO user stories, or structure a feature's information architecture — even if they don't say "ORCA" explicitly. Also trigger when the user has meeting transcripts, intake docs, or research findings and wants to turn them into a structured UX foundation before writing a PRD.
---

# UX ORCA

Run the ORCA process — Objects, Relationships, CTAs, Attributes — to transform raw research into structured information architecture. ORCA is the "third diamond" that sits between user research and screen design, surfacing complexity before you waste time on wireframes.

## What ORCA produces

A single evolving Markdown document with Mermaid diagrams covering four rounds:

1. **Discovery** — smoke out the objects: noun foraging, nested-object matrix, CTA matrix, object map
2. **Requirements** — define each object precisely: object guide, MCSFD, OO user stories, attribute details
3. **Prioritization** — rank for users and business: object priority, nav flow, CTA phasing, attribute force-ranking
4. **Representation** — sketch the screens: card/list/detail wireframes in Mermaid

Each round builds on the previous one. The user validates between rounds.

## Inputs

The skill accepts any combination of:
- **Meeting transcripts** — noun-forage directly from conversation
- **Intake documents** — requirements, briefs, project kickoffs
- **User research** — interviews, journey maps, personas
- **Existing PRDs** — extract objects from stated requirements
- **Codebases** — reverse-engineer objects from data models, schemas, APIs
- **Rough ideas** — the user describes what they're building and you interview to extract objects

If the input is thin, interview the user to fill gaps before starting Round 1. If it's rich, analyze autonomously and present findings for validation.

## Pipeline integration

ORCA sits upstream of `prd-write` and `prd-to-plan`:

```
Research / Transcripts / Intakes
        ↓
    ux-orca          ← synthesize into objects
        ↓
    prd-write         ← OO user stories become PRD user stories;
                        object guide informs implementation decisions;
                        open questions carry forward to PRD risks
        ↓
    prd-to-plan       ← objects/relationships map to vertical slices;
                        nav flow informs route structure;
                        prioritization informs phase ordering
```

When ORCA completes, offer to hand off to `prd-write`. The handoff includes:
- The OO user stories (Round 2) — ready to paste into PRD user stories
- The object guide — informs implementation decisions and module design
- The nav flow and prioritization — informs scoping and phasing
- Open questions — carry forward as PRD risks

## Workflow

### Step 0: Assess inputs

Determine what the user has brought:
- If they've provided research artifacts, read them and proceed to Round 1
- If they have a rough idea, interview them first — ask about the problem space, who the users are, what the key nouns are in their domain. Get enough to start noun foraging
- If they point to a codebase, explore data models and schemas to seed the object list

### Step 1: Discovery (Round 1)

Spawn the discovery agent (`agents/discovery.md`) with the input materials. The agent:
1. Performs noun foraging across all inputs
2. Builds the nested-object matrix
3. Drafts the CTA matrix with identified user roles
4. Creates the initial Object Map (Mermaid graph TD with subgraphs)
5. Creates the Object-Relationship Diagram (Mermaid graph TD)
6. Produces a System Summary table

Present the Round 1 output to the user. Ask:
- "Do these objects look right? Anything missing or misidentified?"
- "Are the user roles correct?"
- Flag any research gaps found during noun foraging

Wait for user validation before proceeding.

### Step 2: Requirements (Round 2)

Spawn the requirements agent (`agents/requirements.md`) with the validated Round 1 output. The agent:
1. Writes the Object Guide (definition, business value, examples)
2. Documents MCSFD for each object
3. Writes OO User Stories
4. Details attributes per object with types and notes
5. Creates State Diagrams (Mermaid stateDiagram-v2) for objects with meaningful state transitions
6. Refines the Object Map with new findings

Present Round 2 output. Ask:
- "Do the user stories capture the right interactions?"
- "Any attributes missing or mis-typed?"
- "Do the state transitions match your understanding?"

### Step 3: Prioritization (Round 3)

Spawn the prioritization agent (`agents/prioritization.md`) with Rounds 1-2 output. The agent:
1. Creates the Object Priority matrix (user priority × business priority)
2. Designs the Nav Flow (Mermaid graph LR)
3. Phases CTAs into P0/P1/P2
4. Force-ranks attributes per object
5. Identifies objects to downgrade, eliminate, or combine

Present Round 3 output. Ask:
- "Does the nav flow match how users should move through this?"
- "Does the CTA phasing align with your launch priorities?"

### Step 4: Representation (Round 4)

Spawn the representation agent (`agents/representation.md`) with Rounds 1-3 output. The agent:
1. Sketches card, list, and detail views as Mermaid block-beta wireframes
2. Maps each wireframe back to the prioritized attributes and CTAs
3. Produces a handoff summary for `prd-write`

Present Round 4 output. Ask:
- "Do these layouts capture the right hierarchy?"
- "Ready to hand off to prd-write, or want to iterate?"

### Step 5: Assemble and save

Combine all rounds into a single document saved to `./orca/<project-name>.md`. The document follows this structure:

```markdown
# <Project Name> ORCA

## Round 1: Discovery
### Noun Foraging
### Nested-Object Matrix
### CTA Matrix
### Object Map
### Object-Relationship Diagram

## Round 2: Requirements
### Object Guide
### MCSFD
### OO User Stories
### Attribute Details
### State Diagrams

## Round 3: Prioritization
### Object Priority
### Nav Flow
### CTA Phasing
### Attribute Force-Ranking

## Round 4: Representation
### [Object]: [View Type] (one per screen)

## System Summary
## Open Questions
## Sources
```

### Step 6: Pipeline handoff

Ask: "Want to feed this into prd-write?" If yes, summarize the ORCA output into a briefing that gives `prd-write` a running start — the objects, user stories, key decisions, and open questions. The user can then invoke `/prd-write` with this context already established.

## Partial runs

Not every project needs all 4 rounds. If the user says "just do discovery" or "I only need through prioritization," stop at the requested round. The document is useful at any stage — even a Round 1 object map clarifies thinking. Always save what you have.

## Iterating

If the user wants to revise after seeing results:
- Re-run the specific round that needs changes (don't restart from scratch)
- Cascade changes forward — if Round 1 objects change, Rounds 2-4 need updating
- The document is the source of truth; update it in place
