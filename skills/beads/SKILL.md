---
name: beads
description: Track tasks with dependencies across agents. Use for coordinating multi-step work, breaking down features, and managing agent workloads. Replaces TodoWrite.
allowed-tools: Bash
---

# Beads - Multi-Agent Task Tracking

Git-backed issue tracker with dependency awareness. Agents check `bd ready` to find work, update status as they proceed, and close tasks when complete.

**Repository:** https://github.com/steveyegge/beads

## Installation

```bash
brew install beads
bd init              # In project root
bd hooks install     # Install git hooks for commit integration
```

## Core Commands

```bash
bd create "task title"                      # Create task
bd create "task" --deps blocks:1,2          # Create with blocking dependencies
bd create "task" --deps discovered-from:5   # Create discovered work from parent task
bd create "task" --priority 0               # Set priority (0=Critical, 4=Backlog)
bd list                                     # Show all tasks
bd ready                                    # Show unblocked tasks only (with --json for parsing)
bd show <id>                                # Show task details
bd update <id> --status in_progress         # Mark in-progress
bd close <id> --reason "Done"               # Mark complete
bd update <id> --status blocked             # Mark blocked
bd note <id> "update message"               # Add progress note
bd sync                                     # MANDATORY at session end - sync state to git
bd doctor                                   # Verify beads health and configuration
```

## Dependency Types

Beads supports rich dependency modeling:

| Type | Usage | Meaning |
|------|-------|---------|
| `blocks` | `--deps blocks:1,2` | This task is blocked by tasks 1 and 2 |
| `parent-child` | `--deps parent:1` | Hierarchical relationship |
| `conditional-blocks` | `--deps conditional-blocks:1` | Only blocks if certain conditions met |
| `waits-for` | `--deps waits-for:3` | Soft dependency, doesn't block |
| `discovered-from` | `--deps discovered-from:5` | Work discovered while working on task 5 |

## Priority System

```bash
bd create "Critical bug" --priority 0    # 0 = Critical
bd create "Important feature" --priority 1    # 1 = High
bd create "Enhancement" --priority 2          # 2 = Medium
bd create "Nice to have" --priority 3         # 3 = Low
bd create "Someday" --priority 4              # 4 = Backlog
```

## Commit Integration

Always include task ID in commit messages:

```bash
git commit -m "Add auth middleware (bd-abc)"
```

The git hook will automatically update task status and link commits.

## Multi-Agent Workflow

### Orchestrator Pattern

Break down work and assign to agents:

```bash
# Create task graph
bd create "Design auth system" --priority 0
bd create "Backend JWT" --deps blocks:1 --priority 1
bd create "Frontend login" --deps blocks:1 --priority 1
bd create "Integration tests" --deps blocks:2,3 --priority 2

# Check what's ready
bd ready --json  # Parse to create task assignments

# Spawn agents for specific tasks
# Fork agents pointing them to specific issue IDs
```

### Agent Pattern

Check for work, claim it, update status:

```bash
# Check what's ready
bd ready --json

# Claim and start work
bd update 2 --status in_progress

# Discover new work while investigating
bd create "Add rate limiting to JWT endpoint" --deps discovered-from:2

# Add progress notes
bd note 2 "JWT middleware complete, testing refresh tokens"

# Complete and unblock dependents
bd close 2 --reason "JWT implementation complete with tests"

# MANDATORY: Sync state before ending session
bd sync
```

## Task States

| State | Meaning |
|-------|---------|
| `open` | Not started, may be blocked |
| `in_progress` | Currently being worked on |
| `blocked` | Waiting on external dependency |
| `closed` | Complete |

## Session Protocol

### Start of Session
```bash
bd doctor                    # Verify health
bd ready --json              # See available work
```

### During Work
```bash
bd update <id> --status in_progress    # Claim task
bd note <id> "progress update"          # Add updates
bd create "subtask" --deps discovered-from:<parent>  # Track discovered work
```

### End of Session
```bash
bd close <id> --reason "completion summary"  # Close completed tasks
bd sync                                       # MANDATORY - sync to git
```

## Visualization

```bash
bd status                    # Overview: total, open, in-progress, blocked, closed
bd graph <id>                # ASCII dependency graph (color-coded)
bd activity --follow         # Real-time streaming feed of changes
```

### Dependency Graph (`bd graph`)

Shows execution order left-to-right with colors:
- White: open (ready to work)
- Yellow: in progress
- Red: blocked
- Green: closed

### Activity Feed (`bd activity`)

```bash
bd activity                  # Last 100 events
bd activity --follow         # Real-time streaming
bd activity --since 1h       # Events from last hour
```

Event symbols: `+` created, `→` in_progress, `✓` completed, `✗` failed, `⊘` deleted

## Integration with CASS

Link task completion to shared memory:

```bash
bd close 5 --reason "Feature complete"
cm outcome success b-123,b-456 --summary "Async validators reduced re-renders by 40%"
cm outcome-apply
```

## Common Patterns

```bash
# Sprint planning
bd create "Feature X" --priority 1 && bd list

# Dependency chain
bd create "API endpoint" --priority 1
bd create "UI component" --deps blocks:1 --priority 2
bd create "Tests" --deps blocks:2 --priority 2

# Check agent workload
bd list | grep in_progress

# Find next work
bd ready --json

# Visualize dependencies
bd graph 1
```

## Best Practices

1. **Always use --json for automation** - When parsing bd output in scripts or for agent assignment
2. **Run bd sync at session end** - MANDATORY to sync state to git
3. **Use discovered-from** - Track work discovered during investigation
4. **Set priorities** - Help agents pick highest-value work
5. **Include bd-xxx in commits** - Enable automatic linking
6. **Run bd doctor weekly** - Catch configuration issues early
7. **Use dependency types precisely** - blocks vs waits-for vs discovered-from have different semantics
8. **Note blockers immediately** - Use `bd note` to explain what's blocking progress
