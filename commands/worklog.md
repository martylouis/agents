# Worklog

Analyze the current git branch and generate a time summary for submitting work hours.

## Steps:

1. Get the current branch name using: `git branch --show-current`

2. Find the merge base with main/master using: `git merge-base HEAD main` or `git merge-base HEAD master` (try main first, fallback to master if main doesn't exist)

3. Get all commits on this branch since the merge base using:
   ```
   git log --oneline --format="%H|%ai|%s" <merge-base>..HEAD
   ```

4. Get the first and last commit timestamps to calculate elapsed time and use human readable time stamps (e.g., "Jan 15, 2024 at 2:30 PM - Jan 16, 2024 at 5:45 PM")

5. Count total commits and files changed:
   - Commits: count from the log
   - Files changed: `git diff --stat <merge-base>..HEAD | tail -1`

6. Extract commit messages to summarize work completed

7. Output ONLY the markdown below with no additional text, commentary, or explanations. The entire response should be pure markdown that can be copied and pasted anywhere:

   ```markdown
   # Work Log - [Branch Name]

   ## Time Period
   **Started:** [First commit date]
   **Completed:** [Last commit date]
   **Duration:** [Calculated elapsed time]

   ## Work Completed

   [Provide a human-readable summary of the work using imperative tense, grouping and synthesizing related commit messages into coherent accomplishments. Use imperative verbs (e.g., "Add", "Implement", "Update", "Fix"). Don't just list raw commit messages - instead, describe what the work achieves in clear, professional language]

   ### Key Changes
   - [Summarized accomplishment in imperative tense, e.g., "Add user authentication system"]
   - [Summarized accomplishment in imperative tense, e.g., "Implement password reset functionality"]
   - [Summarized accomplishment in imperative tense, e.g., "Update API endpoints for better performance"]

   ## Statistics
   - **Commits:** [total-commits]
   - **Files Changed:** [total-files]

   ## Commit Details
   - [commit-message-1]
   - [commit-message-2]
   - [commit-message-3]
   ...

   ---
   *Generated from branch: `[branch-name]`*
   ```

   The summary should:
   - Use clear section headers
   - Write all descriptions in imperative tense (e.g., "Add feature" not "Added feature" or "Adds feature")
   - Translate technical commit messages into business/user-friendly language
   - Group related commits together under Key Changes
   - Include the raw commit details at the bottom for reference
   - Be professional and ready to share with team members or stakeholders

8. Copy the generated markdown output to the system clipboard using `pbcopy` (macOS) or `xclip` (Linux) or `clip` (Windows). Detect the platform and use the appropriate command.

9. If there are no commits on the branch (or branch is same as main/master), output: "No commits found on this branch. Branch may be up to date with main/master."

## Notes:

- Use human-readable date formatting for better readability
- Calculate the elapsed time between first and last commit (consider showing in hours or days as appropriate)
- Handle edge cases like single commit branches or branches with no commits
- If not in a git repository, output an appropriate error message
