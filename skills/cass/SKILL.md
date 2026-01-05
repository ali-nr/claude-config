---
name: cass
description: Search past sessions across all coding agents (Claude Code, Gemini, Codex) before starting work. Find what was discussed, solutions tried, and decisions made.
---

# CASS - Coding Agent Session Search

Search AI coding session history across all agents in your multi-agent workflow.

**Repository:** https://github.com/Dicklesworthstone/cass_memory_system

## When to Use

**ALWAYS search before starting work:**
- Has this problem been solved before?
- What did other agents (Gemini, Codex) discuss about this?
- What approaches were tried and rejected?
- What decisions were made about this codebase?

## Installation

```bash
# Try Homebrew first
brew install cass

# Or use cargo if not available
cargo install cass

# Build the search index
cass index
```

## Core Workflow

### 1. Search Before You Start

```bash
# Find past discussions about your current task
cass search "authentication bug" --json

# Filter by specific agent
cass search "API timeout" --agent claude
cass search "database migration" --agent gemini

# Recent activity only
cass search "performance" --days 7
```

### 2. Cross-Agent Discovery

```bash
# What did ANY agent discuss about this?
cass search "user service refactor"

# Compare approaches across agents
cass search "caching strategy" --agent claude
cass search "caching strategy" --agent gemini
```

### 3. Timeline & Context

```bash
# What happened today across all agents?
cass timeline --today

# Recent activity
cass timeline --days 3
```

## Visualization

```bash
cass tui                     # Interactive TUI for browsing sessions
cass stats                   # Statistics about indexed data
cass timeline --today        # Activity timeline
cass status                  # Quick health check with recommendations
```

### Interactive TUI (`cass tui`)

Launch a full interactive terminal UI for browsing and searching sessions.

### Stats (`cass stats`)

Shows statistics about indexed sessions, agents, and message counts.

## Maintenance

```bash
# Quick health check
cass health

# Detailed status with recommendations
cass status

# Rebuild index if stale
cass index --rebuild
```

## Best Practices

- **Search first**: Before starting any task, search for related past work
- **Cross-pollinate**: Check what other agents learned about similar problems
- **Use specific terms**: Search for error messages, file names, function names
- **Check recency**: Use `--days` to focus on recent context

## Integration with cm (Memory)

CASS and cm work together:
- **cass**: Search what was DISCUSSED (session transcripts)
- **cm**: Get CONTEXT for current task (structured memory)

Workflow:
```bash
# 1. Search past sessions
cass search "user authentication"

# 2. Get current task context
cm context "implement OAuth flow"
```
