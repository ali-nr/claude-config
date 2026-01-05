---
name: agent-protocol
description: Standard protocol ALL agents must follow for every work session. Defines START, DURING, and END phases with mandatory checklists. Reference this in all agent workflows.
allowed-tools: Bash
---

# Agent Protocol - Universal Session Standard

This is the canonical protocol that ALL agents (Claude, Gemini, Codex, Cursor, Aider) MUST follow for every work session.

**Non-negotiable.** Every agent follows this, every time.

## Three-Phase Protocol

Every work session has three mandatory phases:

```
START → DURING → END
```

Skipping any phase is a protocol violation.

---

## START Phase (Pre-Work Checklist)

**Purpose:** Load context, claim work, prepare for execution.

### 1. Load CASS Context

```bash
cm context "task description" --json
```

**Why:** Pull relevant patterns, rules, and learnings from all agents. Review the output before proceeding.

### 2. Search Related Patterns

Review the JSON output from step 1. Look for:
- Helpful patterns (high scores)
- Harmful patterns to avoid (negative scores)
- Related context from other agents

### 3. Claim Task

```bash
bd update <task-id> --status in_progress
```

**Why:** Signal to other agents that this work is being done. Prevents duplicate effort.

### Checklist

- [ ] `cm context --json` executed
- [ ] Output reviewed for relevant patterns
- [ ] Task marked as `in_progress` in Beads
- [ ] Ready to begin implementation

---

## DURING Phase (Work Execution)

**Purpose:** Execute work while capturing learnings in real-time.

### 1. Add Inline CASS Feedback

As you write code, add feedback comments:

```javascript
// [cass: helpful b-abc123] This validation pattern caught edge cases early
function validateInput(data) {
  // [cass: harmful b-xyz789] Regex was too slow, switched to manual parsing
  return manualParse(data);
}
```

**Syntax:**
- `// [cass: helpful b-<id>] <specific reason why it worked>`
- `// [cass: harmful b-<id>] <specific reason why it failed>`

### 2. Track Discovered Work

When you discover new tasks during investigation:

```bash
bd create "New subtask found" --deps discovered-from:<parent-task-id> --priority 2
```

**Why:** Captures scope creep and tracks where work came from.

### 3. Add Progress Notes

For long-running tasks, update progress:

```bash
bd note <task-id> "Completed auth middleware, now working on tests"
```

**Frequency:** At least once per significant milestone.

### Checklist

- [ ] Inline CASS feedback added to code
- [ ] Discovered work tracked with `discovered-from`
- [ ] Progress notes added for significant milestones
- [ ] Code follows project conventions

---

## END Phase (Post-Work Checklist)

**Purpose:** Close work, record outcomes, sync state.

### 1. Close Task

```bash
bd close <task-id> --reason "Brief summary of what was completed"
```

**Be specific:** "Implemented JWT auth with refresh tokens and tests" not "Done"

### 2. Record CASS Outcomes

Identify which specific bullet IDs helped or hurt:

```bash
# Record successful patterns
cm outcome success b-123,b-456,b-789 --summary "JWT with httpOnly cookies prevented XSS, retry logic handled network errors"

# Record failed patterns
cm outcome failure b-999 --summary "Client-side validation approach was bypassed, moved to server-side"
```

**Be specific:** Include what worked/failed and why.

### 3. Apply Outcomes

```bash
cm outcome-apply
```

**Why:** Updates playbook scores so future agents benefit.

### 4. Sync Task State (MANDATORY)

```bash
bd sync
```

**Why:** Writes task state to git. Without this, your work is lost.

### 5. Verify Completion

```bash
bd status              # Check task state
cm stats               # Check memory health
```

### Checklist

- [ ] Task closed with specific reason
- [ ] Outcomes recorded with bullet IDs
- [ ] `cm outcome-apply` executed
- [ ] `bd sync` executed (MANDATORY)
- [ ] Status verified

---

## Protocol Violations

These are **failures**, not warnings:

| Violation | Impact |
|-----------|--------|
| Skip `cm context` | Agent misses relevant patterns, repeats mistakes |
| Skip `bd update --status` | Other agents may duplicate work |
| Skip inline feedback | Learnings lost, can't improve |
| Skip `cm outcome` | Memory doesn't improve, agent doesn't learn |
| Skip `bd sync` | Work state lost, other agents see stale data |

**If you skip any phase, the session is considered failed.**

---

## Quick Reference Card

```bash
# START
cm context "task" --json
bd update <id> --status in_progress

# DURING
# [cass: helpful b-xxx] inline feedback
bd create "discovered work" --deps discovered-from:<parent>
bd note <id> "progress update"

# END
bd close <id> --reason "summary"
cm outcome success b-x,b-y --summary "what worked"
cm outcome failure b-z --summary "what failed"
cm outcome-apply
bd sync
```

---

## Integration with Other Skills

This protocol is referenced by:
- `run-agent` - Spawning agents in tmux
- `lead-engineer` - Morning/evening orchestration
- `beads` - Task management
- `cass-memory` - Memory system

All agent-facing skills should reference this protocol.

---

## For Lead Engineers

When reviewing agent work, verify protocol compliance:

```bash
# Check if agent closed task
bd activity --since 1h | grep "✓"

# Check if agent synced
git log --since="1 hour ago" | grep "bd-"

# Check if memory was updated
cm stats
```

**If an agent skipped the protocol, their work needs review.**

---

## Example Full Session

```bash
# === START ===
cm context "Add rate limiting to API" --json
# Reviews output: b-123 suggests token bucket, b-456 warns against memory-based
bd update 42 --status in_progress

# === DURING ===
# Implements rate limiting
# [cass: helpful b-123] Token bucket algorithm worked perfectly
# [cass: harmful b-456] Memory-based approach would fail in multi-instance setup

bd create "Add rate limit monitoring dashboard" --deps discovered-from:42 --priority 3
bd note 42 "Rate limiting implemented, writing tests"

# === END ===
bd close 42 --reason "Rate limiting with token bucket algorithm, 100 req/min limit, integration tests passing"
cm outcome success b-123 --summary "Token bucket prevented API abuse while maintaining performance"
cm outcome failure b-456 --summary "Memory-based approach incompatible with horizontal scaling"
cm outcome-apply
bd sync

# Verify
bd status
cm stats
```

---

## Notes

- This protocol is **mandatory** for all agents
- Each phase has specific commands that MUST be executed
- Skipping any phase is a protocol violation
- Lead engineers should verify compliance
- The protocol enables cross-agent learning and coordination
- Inline feedback is parsed during `cm reflect`
- Always use `--json` when building automation
