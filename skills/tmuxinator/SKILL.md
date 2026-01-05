---
name: tmuxinator
description: Create and manage tmuxinator YAML templates for multi-agent team setups. Use when setting up persistent multi-pane environments with Claude Code as lead agent and Gemini/Codex as workers. Declarative alternative to imperative tmux commands.
---

# Tmuxinator Template Manager

**Purpose**: Create declarative YAML templates for repeatable multi-agent team environments. Complements the tmux skill with configuration-as-code approach.

## When to Use

- Setting up multi-agent teams with consistent layouts (Claude + Gemini + Codex)
- Creating reusable project environments with specific pane arrangements
- Defining startup commands and working directories per pane
- Managing multiple team configurations (frontend team, backend team, etc.)

**Use tmux skill for**: Ad-hoc session creation, dynamic pane manipulation, capturing output
**Use tmuxinator skill for**: Template creation, repeatable team setups, configuration management

## Prerequisites

```bash
# Install tmuxinator
brew install tmuxinator

# Verify installation
mux version
```

## Config Location

Templates live at: `~/.config/tmuxinator/`

```bash
# List all templates
ls ~/.config/tmuxinator/*.yml

# Common templates you'll create
~/.config/tmuxinator/agent-team.yml     # Multi-agent orchestration
~/.config/tmuxinator/dev-env.yml        # Development environment
~/.config/tmuxinator/review-team.yml    # Code review team
```

## Core Commands

```bash
# Create new template (opens editor)
mux new <template-name>

# Start session from template
mux start <template-name>
mux start <template-name> /path/to/project  # With argument

# List all templates
mux list

# Edit existing template
mux edit <template-name>

# Delete template
mux delete <template-name>

# Stop session
mux stop <template-name>
tmux kill-session -t <session-name>  # Alternative
```

## Template Anatomy

### Basic Structure

```yaml
# ~/.config/tmuxinator/example.yml
name: example                    # Session name when started
root: ~/projects/myproject       # Default working directory

windows:
  - editor:                      # Window 1 name
      layout: main-vertical      # Layout algorithm
      panes:
        - vim                    # Pane 1 command
        - guard                  # Pane 2 command

  - server:                      # Window 2 name
      panes:
        - npm run dev            # Single pane
```

### Layout Options

| Layout | Description | Use Case |
|--------|-------------|----------|
| `even-horizontal` | All panes equal height, stacked | Monitoring multiple logs |
| `even-vertical` | All panes equal width, side by side | Side-by-side code comparison |
| `main-horizontal` | One large top pane, small bottom panes | Main work + auxiliary agents |
| `main-vertical` | One large left pane, small right panes | Editor + tools |
| `tiled` | Grid layout | 4+ panes in balanced grid |
| Custom | Manual percentage splits | Precise control (see below) |

### Pane Split Syntax

```yaml
# Horizontal split (stacked top/bottom)
panes:
  - top-pane-command
  - bottom-pane-command

# Vertical split (side by side)
panes:
  -
    - left-pane-command
    - right-pane-command

# Complex nested splits
panes:
  - top-pane                     # Top pane (full width)
  -                              # Bottom half split vertically
    - bottom-left-pane
    - bottom-right-pane
```

### Per-Pane Working Directory

```yaml
windows:
  - main:
      root: ~/projects/frontend    # Override root for this window
      panes:
        - npm run dev
        -
          - cd backend && rails s  # Inline directory change
          - root: ~/projects/api   # Or set per-pane root
            pane: npm start
```

## Multi-Agent Team Templates

### Template 1: Lead + Two Workers (Primary Use Case)

```yaml
# ~/.config/tmuxinator/agent-team.yml
name: agent-team
root: ~/projects/<%= @args[0] %>  # Pass project path: mux agent-team myproject

windows:
  - team:
      layout: main-horizontal
      panes:
        - claude:                          # Top pane: Lead agent (60% height)
            - echo "Lead Agent: Claude Code"
            - claude

        - workers:                         # Bottom 40% split vertically
            -
              - gemini:                    # Bottom-left: Worker 1
                  - echo "Worker: Gemini"
                  - gemini "Awaiting task assignment..."

              - codex:                     # Bottom-right: Worker 2
                  - echo "Worker: Codex"
                  - codex "Ready for work..."
```

**Usage:**
```bash
# Start the team
mux start agent-team ~/projects/my-app

# Lead agent (Claude) assigns tasks
# Top pane: claude
# Bottom-left: gemini "analyze security vulnerabilities in src/"
# Bottom-right: codex "write integration tests for API endpoints"
```

### Template 2: Four-Agent Grid

```yaml
# ~/.config/tmuxinator/quad-team.yml
name: quad-team
root: ~/projects

windows:
  - grid:
      layout: tiled              # Auto-arranges 4 panes in 2x2 grid
      panes:
        - claude:                # Top-left: Lead orchestrator
            - claude

        - gemini:                # Top-right: Analysis agent
            - gemini "Ready for analysis tasks"

        - codex:                 # Bottom-left: Implementation agent
            - codex "Ready for coding tasks"

        - monitor:               # Bottom-right: Task monitor
            - bd list --watch    # Live task board
```

### Template 3: Lead + Monitoring

```yaml
# ~/.config/tmuxinator/dev-team.yml
name: dev-team
root: ~/projects/<%= @args[0] %>

windows:
  - development:
      layout: main-vertical      # Large left pane, small right panes
      panes:
        - claude:                # Left 70%: Primary development
            - claude

        - monitors:              # Right 30% stacked
            -
              - tasks:           # Top-right: Task status
                  - bd list --watch

              - memory:          # Bottom-right: Shared memory
                  - cm tail      # Watch CASS memory updates
```

### Template 4: Project with Dev Server

```yaml
# ~/.config/tmuxinator/fullstack.yml
name: fullstack
root: ~/projects/<%= @args[0] %>

windows:
  - agents:
      layout: main-horizontal
      panes:
        - claude:
            - claude

        - workers:
            -
              - gemini: gemini "Ready"
              - codex: codex "Ready"

  - servers:                     # Separate window for dev servers
      layout: even-vertical
      panes:
        - frontend:
            - root: ~/projects/<%= @args[0] %>/frontend
            - npm run dev

        - backend:
            - root: ~/projects/<%= @args[0] %>/backend
            - npm start

        - database:
            - docker-compose up postgres
```

## Advanced Features

### Startup Commands (Pre-window)

```yaml
name: agent-team
root: ~/projects

# Run these BEFORE creating windows
pre_window:
  - git fetch origin
  - bd sync                      # Sync tasks from remote
  - cm context "project setup"   # Load relevant memory

windows:
  - team:
      panes:
        - claude
```

### Arguments and ERB Templates

```yaml
name: project-team
root: <%= ENV['HOME'] %>/projects/<%= @args[0] %>

windows:
  - main:
      panes:
        - echo "Starting <%= @args[0] %>"
        - claude
```

**Usage:**
```bash
mux start project-team my-app           # @args[0] = "my-app"
mux start project-team backend-api      # @args[0] = "backend-api"
```

### Conditional Panes

```yaml
windows:
  - development:
      panes:
        - claude
        <% if @args.include?('--with-gemini') %>
        - gemini "Analysis mode"
        <% end %>
```

### Post-Start Hooks

```yaml
name: agent-team

on_project_start:
  - cm add "Agent team started at $(date)"

on_project_stop:
  - cm add "Agent team stopped. Summary: $(bd list --closed-today)"
```

## Integration with Beads & CASS

### Pattern: Agents Check Tasks on Startup

```yaml
# ~/.config/tmuxinator/task-team.yml
name: task-team

pre_window:
  - bd sync                      # Get latest tasks

windows:
  - orchestration:
      panes:
        - lead:
            - claude
            - echo "Available tasks:"
            - bd list --blocked-by=''

        - workers:
            -
              - gemini:
                  - echo "Worker 1 ready. Checking high-priority tasks..."
                  - bd list --priority=high

              - codex:
                  - echo "Worker 2 ready. Checking test tasks..."
                  - bd list --tag=testing
```

### Pattern: Agents Update Shared Memory

```yaml
windows:
  - team:
      panes:
        - claude:
            - claude
            - echo "Tip: Use 'cm add' to share findings with other agents"

        - gemini:
            - gemini "After completing analysis, run: cm add 'Analysis: <summary>'"
```

## Template Creation Workflow

### Quick Method (Interactive)

```bash
# Create template with editor
mux new agent-team

# Edit in your $EDITOR, save, then start
mux start agent-team
```

### Programmatic Method

```bash
# Create from scratch
cat > ~/.config/tmuxinator/my-team.yml <<'EOF'
name: my-team
root: ~/projects

windows:
  - main:
      panes:
        - claude
EOF

# Validate and start
mux start my-team
```

### Copy and Modify Existing

```bash
# Copy template
cp ~/.config/tmuxinator/agent-team.yml ~/.config/tmuxinator/new-team.yml

# Edit name and customize
sed -i '' 's/name: agent-team/name: new-team/' ~/.config/tmuxinator/new-team.yml
mux edit new-team
```

## Common Patterns

### Pattern: Attach to Lead, Detach Workers

```yaml
name: hybrid-team

# Start session NOT attached (default)
attach: false

windows:
  - main:
      panes:
        - claude                 # Work here interactively
        -
          - gemini "task 1"      # These run in background
          - codex "task 2"
```

**Usage:**
```bash
mux start hybrid-team     # Starts detached
tmux attach -t hybrid-team       # Attach when ready
```

### Pattern: Selective Startup

```yaml
name: flexible-team
root: ~/projects

windows:
  - main:
      panes:
        - claude

  - analysis:
      panes:
        - gemini "Ready"

  - testing:
      panes:
        - codex "Ready"
```

**Start specific windows only:**
```bash
# Start just main window
mux start flexible-team main

# Start main + analysis
mux start flexible-team main,analysis
```

## Troubleshooting

### Template Not Found

```bash
# Check template name
mux list

# Check file exists
ls ~/.config/tmuxinator/my-template.yml
```

### Session Already Exists

```bash
# Kill existing session first
tmux kill-session -t agent-team

# Then start fresh
mux start agent-team
```

### Pane Layout Not as Expected

```yaml
# WRONG: This creates 3 separate panes horizontally
panes:
  - pane1
  - pane2
  - pane3

# RIGHT: Top pane + bottom split vertically
panes:
  - pane1              # Top
  -                    # Bottom split
    - pane2            # Bottom-left
    - pane3            # Bottom-right
```

### Commands Not Running

```yaml
# WRONG: Command runs but exits immediately
panes:
  - echo "Hello"       # Echoes then closes pane

# RIGHT: Keep pane open with shell after command
panes:
  -
    - echo "Hello"
    - bash             # Keeps pane alive

# BETTER: Use interactive command
panes:
  - claude             # Stays open by nature
```

## Quick Reference

| Task | Command |
|------|---------|
| Create template | `mux new <name>` |
| Start from template | `mux start <name>` |
| List templates | `mux list` |
| Edit template | `mux edit <name>` |
| Delete template | `mux delete <name>` |
| Stop session | `mux stop <name>` |
| Kill running session | `tmux kill-session -t <name>` |

## Template Library

Start with these templates for common scenarios:

1. **agent-team.yml** - Lead + 2 workers (primary use case)
2. **quad-team.yml** - 4-agent grid for complex projects
3. **dev-team.yml** - Development with monitoring panes
4. **fullstack.yml** - Agents + dev servers in separate windows
5. **task-team.yml** - Integration with beads task management

Create templates once, reuse across projects by passing project path as argument.

## Complementary to Tmux Skill

**Use tmuxinator when:**
- Setting up repeatable multi-agent environments
- Defining consistent project layouts
- Creating templates for different team compositions
- Managing startup sequences and working directories

**Use tmux commands when:**
- Interacting with running sessions (send-keys, capture-pane)
- Dynamically adding/removing panes during work
- Monitoring agent output and status
- Sending follow-up commands to background agents

**Together:** Tmuxinator creates the foundation, tmux manages the runtime.
