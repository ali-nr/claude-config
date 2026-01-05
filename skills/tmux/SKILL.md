---
name: tmux
description: Manage tmux sessions and spawn AI agents (Claude, Gemini, Codex) for parallel work. Use for multi-agent orchestration, background processes, dev servers, and persistent sessions.
---

# Tmux - Session & Agent Manager

**Purpose**: Run AI agents and background processes in persistent tmux sessions. Core tool for multi-agent orchestration.

## When to Use

- Spawning parallel AI agents (Gemini, Codex, other Claude instances)
- Running long-running commands (dev servers, builds, tests)
- Background task monitoring without blocking main workflow
- Persisting work across terminal disconnections

## Agent Commands

| Agent | Command | Notes |
|-------|---------|-------|
| Claude | `claude` | Lead agent, architecture/design |
| Gemini | `gemini "task"` | Research, exploration |
| Codex | `/opt/homebrew/bin/codex` | Implementation |

## Agent Strengths

| Agent | Best For | Typical Tasks |
|-------|----------|---------------|
| **Claude** | Architecture, design, complex reasoning | System design, refactoring, planning |
| **Gemini** | Exploration, research, broad analysis | Codebase analysis, investigating options |
| **Codex** | Implementation, code generation | Feature implementation, boilerplate |

## Quick Start: Spawn Agent

```bash
# Interactive - you watch the agent work
tmux new -s myagent
gemini "analyze the codebase"

# One-liner (attach immediately)
tmux new -s myagent "gemini 'analyze the codebase'"

# Background (detached)
tmux new-session -d -s gemini-task "gemini 'analyze codebase'"
```

## Multi-Agent Team (Manual)

```bash
# Start session
tmux new -s agents

# Split and run agents (you're attached, watching)
# Ctrl+B | → split side by side
# Run: gemini "task 1"

# Ctrl+B - → split top/bottom
# Run: codex "task 2"

# Navigate: Ctrl+B h/j/k/l
```

**Tip**: For repeatable team setups, use tmuxinator: `mux team ~/project`

## Core Commands

### Session Management

```bash
# Create detached session
tmux new-session -d -s <name>
tmux new-session -d -s <name> "<command>"
tmux new-session -d -s <name> -c /path/to/dir

# List sessions
tmux ls

# Attach to session
tmux attach -t <name>

# Detach (when attached)
Ctrl+B d

# Kill session
tmux kill-session -t <name>

# Kill all sessions
tmux kill-server
```

### Sending Commands

```bash
# Send command to session
tmux send-keys -t <name> "<command>" Enter

# Control sequences
tmux send-keys -t <name> C-c        # Ctrl+C (interrupt)
tmux send-keys -t <name> C-d        # Ctrl+D (EOF)

# Target specific pane
tmux send-keys -t <name>.0 "<command>" Enter
tmux send-keys -t <name>.1 "<command>" Enter
```

### Capturing Output

```bash
# Get current pane content
tmux capture-pane -t <name> -p

# Get last N lines
tmux capture-pane -t <name> -p -S -100

# Capture from specific pane
tmux capture-pane -t <name>.0 -p

# Save to file
tmux capture-pane -t <name> -p > output.txt
```

### Pane Management

```bash
# Split panes
tmux split-window -t <name> -h  # Side by side (|)
tmux split-window -t <name> -v  # Top/bottom (-)

# Target specific window/pane
tmux send-keys -t <name>:<window>.<pane> "<cmd>" Enter
```

## Patterns

### Monitor Running Agents

```bash
# List all sessions
tmux ls

# View agent output without attaching
tmux capture-pane -t gemini:0 -p | tail -20

# Watch agent progress
watch -n 5 'tmux capture-pane -t claude:0 -p | tail -10'
```

### Agent Handoff

```bash
# Agent A finishes, notifies Agent B
tmux send-keys -t agent-b "# Agent A completed migration. Proceed with tests." Enter
tmux send-keys -t agent-b "pytest tests/integration/" Enter
```

### Cleanup

```bash
# Kill completed session
tmux kill-session -t completed-agent

# Kill multiple sessions
tmux ls | grep 'old-' | cut -d: -f1 | xargs -I {} tmux kill-session -t {}
```

## Integration with Beads & CASS

```bash
# Agent workflow: Check tasks → Do work → Update
tmux new-session -d -s worker

# Check what's ready
tmux send-keys -t worker "bd ready" Enter

# After work, agent updates
tmux send-keys -t worker "bd close 123 --reason 'Done'" Enter
tmux send-keys -t worker "cm outcome success b-123 --summary 'Completed API'" Enter
tmux send-keys -t worker "bd sync" Enter
```

## User's Keybindings (Ctrl+B leader)

| Key | Action |
|-----|--------|
| `\|` | Split side by side |
| `-` | Split top/bottom |
| `h/j/k/l` | Navigate panes (vim) |
| `H/J/K/L` | Resize panes |
| `x` | Close pane |
| `z` | Zoom pane |
| `c` | New tab |
| `n/p` | Next/prev tab |
| `[` | Copy mode |
| `d` | Detach |

## Quick Reference

| Task | Command |
|------|---------|
| Create background session | `tmux new-session -d -s name` |
| Run command in session | `tmux send-keys -t name "cmd" Enter` |
| View output | `tmux capture-pane -t name -p` |
| List sessions | `tmux ls` |
| Attach | `tmux attach -t name` |
| Detach | `Ctrl+B d` |
| Kill session | `tmux kill-session -t name` |
| Split pane | `tmux split-window -t name -h` |
| Stop command | `tmux send-keys -t name C-c` |
