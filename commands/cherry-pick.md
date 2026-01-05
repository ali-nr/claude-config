---
description: Pick specific files from another branch or commit
argument-hint: <branch-or-commit> [files...]
allowed-tools: Bash
model: haiku
---

# Cherry-Pick Files Command

Pick specific files from another branch or commit into the current branch.

## Arguments

- `$1` (required): Source branch name or commit hash
- `$2+` (optional): Specific file paths to pick
  - If not provided, show available files and prompt user to choose

## Context

### Working Tree Status
<git_status>
!`git status`
</git_status>

### Current Branch
<current_branch>
!`git branch --show-current`
</current_branch>

### Recent Branches
<recent_branches>
!`git branch --sort=-committerdate | head -10`
</recent_branches>

## Instructions

### Step 1: Validate Source

Check that `$1` is provided:
- If missing, show recent branches and STOP with message: "Usage: /cherry-pick <branch-or-commit> [files...]"

Verify the source exists:
```bash
git rev-parse --verify $1
```

If verification fails, STOP and show clear error.

### Step 2: Show Available Changes

Display what changed in the source:
```bash
git show --name-status $1
```

This helps the user see what files are available to pick.

### Step 3: Determine Files to Pick

**If files were provided as arguments (`$2+`):**
- Use those file paths directly
- Proceed to Step 4

**If no files were provided:**
- Ask: "Which files do you want to pick? (provide paths or 'all')"
- Present the available files from Step 2 clearly
- Wait for user response with specific paths or 'all'

### Step 4: Execute the Cherry-Pick

For each selected file, copy it from the source and stage it:

```bash
# For a single file
git checkout $1 -- path/to/file.txt

# For multiple files
git checkout $1 -- path/to/file1.txt path/to/file2.txt

# For all files (if user specified 'all')
git checkout $1 -- .
```

### Step 5: Show the Result

Display what was staged:
```bash
git diff --cached --stat
```

### Step 6: Confirm Completion

Inform the user:
- List the files that were picked
- Show the source (branch/commit) they came from
- Remind: "Files are staged and ready to commit with `/commit`"

## Constraints

- NEVER proceed if source branch/commit doesn't exist
- ALWAYS stage files automatically (git checkout stages them)
- ALWAYS show git diff --cached to confirm what was picked
- If user has uncommitted changes, warn but allow (git will fail safely if conflicts)
- If cherry-pick affects already-modified files, let git handle conflicts naturally

## Error Handling

If git checkout fails:
- Show the error clearly
- Explain likely cause (file doesn't exist in source, conflict, etc.)
- Suggest resolution
- STOP - do not continue

## Examples

### Interactive: Choose Files After Seeing the List

```bash
/cherry-pick feat/dark-mode
```

Shows available files, then prompts user to select which ones to pick.

### Direct: Pick Specific Files Immediately

```bash
/cherry-pick feat/dark-mode src/theme.ts src/styles.css
```

Picks only those two files from the feat/dark-mode branch.

### Pick From a Commit Hash

```bash
/cherry-pick a1b2c3d src/utils.ts
```

Picks a single file from a specific commit.

### Pick All Files

```bash
/cherry-pick main
```

Then when prompted, respond with: `all`

This picks all changed files from the main branch.

## Usage

```bash
/cherry-pick <source>              # Interactive file selection
/cherry-pick <source> file1 file2  # Pick specific files
/cherry-pick <source> .            # Pick all files (use with caution)
```
