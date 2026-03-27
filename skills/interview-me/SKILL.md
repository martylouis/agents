---
name: interview-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, clarify intent, overlooked considerations, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me" or "interview me".
argument-hint: "[optional: problem description]"
---

Use the AskUserQuestion tool to conduct a structured relentless interview about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree resolving dependencies between decisions one by one.

If a question can be answered by exploring the codebase, explore the codebase instead.

If `$ARGUMENTS` is provided, use it as the initial problem description. Otherwise, begin by asking what problem the user wants to solve.
