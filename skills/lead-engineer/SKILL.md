---
name: lead-engineer
description: Daily workflows for orchestrating multi-agent teams. Use PROACTIVELY at start/end of day to manage Claude, Gemini, and Codex agents. Includes task assignment, health checks, and outcome review.
allowed-tools: Bash
---

# Lead Engineer - Multi-Agent Orchestration

Workflows for managing a team of AI agents (Claude, Gemini, Codex) working in parallel.

**Role:** You are the orchestrator. Agents are the implementers.

## Morning Workflow

Start your day by setting up agents for productive work.

### 1. System Health Check

```bash
# Verify tools are healthy
bd doctor
cm doctor
```

**Fix any issues before proceeding.** Unhealthy systems = wasted agent time.

### 2. Review Available Work

```bash
# Get all ready tasks with full context
bd ready --json > /tmp/ready-tasks.json

# Review task graph
bd status
bd graph 1  # Visualize dependencies
```

**Understand the landscape** before assigning work.

### 3. Create Task Graph (if needed)

Break down new work into tasks:

```bash
bd create "Feature: User authentication" --priority 0
bd create "Design auth flow" --deps blocks:1 --priority 1
bd create "Implement JWT backend" --deps blocks:2 --priority 1
bd create "Implement login UI" --deps blocks:2 --priority 1
bd create "Integration tests" --deps blocks:3,4 --priority 2
```

**Principle:** Each task should be:
- Independently verifiable
- Completable in one session
- Clearly blocked or unblocked

### 4. Spawn Agent Team

Use tmuxinator to start the interactive multi-agent layout:

```bash
# Start the team template (you stay attached and can see all agents)
mux start team /path/to/project
```

This creates a 3-pane layout:
```
┌─────────────────────────────────────┐
│           Claude (Lead)             │  ← Top: Architecture/design
├──────────────────┬──────────────────┤
│      Gemini      │      Codex       │  ← Bottom: Research | Implementation
└──────────────────┴──────────────────┘
```

### 5. Assign Tasks to Agents

From the Claude pane (top), send tasks to workers:

```bash
# You're in Claude (top pane) - assign work to bottom panes
# Ctrl+B ↓  → move to Gemini pane
gemini "Analyze current auth patterns in codebase"

# Ctrl+B →  → move to Codex pane
codex "Implement JWT token generation middleware"

# Ctrl+B ↑  → return to Claude pane for your own work
```

Or send commands without switching panes:

```bash
# From any pane, send to specific agent
tmux send-keys -t team:agents.1 "gemini 'Research OAuth2 best practices'" Enter
tmux send-keys -t team:agents.2 "codex 'Implement login endpoint'" Enter
```

**Stay attached** - watch your agents work in real-time.

### 6. Set Expectations

Brief check of what each agent should produce:

| Agent | Task | Expected Output |
|-------|------|-----------------|
| Claude | Design | Architecture doc, sequence diagrams |
| Gemini | Analysis | Security report, pattern summary |
| Codex | Implementation | Working code with tests |

### Morning Checklist

- [ ] `bd doctor` and `cm doctor` passing
- [ ] Task graph reviewed and complete
- [ ] `mux start team <project>` started
- [ ] Tasks assigned to agents in each pane
- [ ] Watching agents work (or Ctrl+B d to detach)

---

## During the Day (Check-ins)

Periodically monitor without micromanaging.

### Quick Status Check

```bash
# See active work
bd list | grep in_progress

# Check recent activity
bd activity --since 1h

# Re-attach to team (if detached)
tmux attach -t team

# View agent outputs without attaching
tmux capture-pane -t team:agents.0 -p | tail -20  # Claude
tmux capture-pane -t team:agents.1 -p | tail -20  # Gemini
tmux capture-pane -t team:agents.2 -p | tail -20  # Codex
```

### When to Intervene

**Only intervene if:**
- Agent appears stuck (no activity for >30 min)
- Agent is working on wrong task
- Blocking issue discovered

**Otherwise:** Let agents work. Trust the protocol.

### Quick Intervention

```bash
# Already attached? Just navigate:
# Ctrl+B ↓  → move to Gemini
# Ctrl+B →  → move to Codex
# Ctrl+B ↑  → back to Claude

# If detached, re-attach:
tmux attach -t team
```

---

## Evening Workflow

End your day by reviewing outcomes and cleaning up.

### 1. Capture Agent Outputs

```bash
# Create review directory
mkdir -p ~/agent-reviews/$(date +%Y-%m-%d)
cd ~/agent-reviews/$(date +%Y-%m-%d)

# Capture all agent outputs from team session
tmux capture-pane -t team:agents.0 -p -S - > claude-output.txt
tmux capture-pane -t team:agents.1 -p -S - > gemini-output.txt
tmux capture-pane -t team:agents.2 -p -S - > codex-output.txt
```

**Why:** Creates a record for review and debugging.

### 2. Review Task Status

```bash
# Overall status
bd status

# What was completed today
bd activity --since 8h

# What's blocked
bd list | grep blocked

# Visualize progress
bd graph 1
```

### 3. Review Memory Health

```bash
# Playbook health
cm stats

# Top performing rules
cm top

# Stale rules needing feedback
cm stale
```

### 4. Approve/Reject Agent Work

Review each agent's output:

```bash
# Read outputs
cat claude-output.txt
cat gemini-output.txt
cat codex-output.txt
```

**For each agent, verify:**
- [ ] Task was closed (`bd close`)
- [ ] CASS outcomes recorded (`cm outcome`)
- [ ] State synced (`bd sync`)
- [ ] Work quality acceptable

**If work is rejected:**

```bash
# Reopen task
bd update <id> --status open

# Add note explaining why
bd note <id> "Rejected: Missing error handling in auth flow. See security requirements."

# Remove bad outcomes (if agent recorded them)
# (Manual cleanup in playbook)
```

### 5. Cleanup Team Session

```bash
# Kill the team session when done
tmux kill-session -t team

# Or stop via tmuxinator
mux stop team

# Verify cleanup
tmux ls
```

**Only kill if work is complete.** Leave running for ongoing tasks.

### 6. Plan Tomorrow

```bash
# Review what's ready for tomorrow
bd ready --json

# Create any new tasks discovered
bd create "New task from today's learnings" --priority 2

# Sync final state
bd sync
```

### Evening Checklist

- [ ] All agent outputs captured
- [ ] Task status reviewed
- [ ] Memory health checked
- [ ] Agent work approved/rejected
- [ ] Completed sessions cleaned up
- [ ] Tomorrow's work identified
- [ ] Final `bd sync` completed

---

## Agent Assignment Strategy

Choose agents based on task characteristics:

### Claude (Architecture & Design)

**Best for:**
- System design and architecture
- Complex refactoring
- Documentation and technical writing
- Security design
- API design
- Trade-off analysis

**Example tasks:**
- "Design authentication system with OAuth2"
- "Refactor payment processing for better error handling"
- "Document API endpoints with OpenAPI spec"

### Gemini (Exploration & Analysis)

**Best for:**
- Codebase exploration
- Security analysis
- Performance investigation
- Research and options analysis
- Identifying patterns
- Broad impact analysis

**Example tasks:**
- "Analyze all authentication patterns in codebase"
- "Investigate performance bottlenecks in API layer"
- "Research rate limiting approaches for our use case"

### Codex (Implementation)

**Best for:**
- Feature implementation
- Boilerplate generation
- Test writing
- Bug fixes
- Code translation
- Routine refactoring

**Example tasks:**
- "Implement JWT token generation middleware"
- "Write integration tests for auth endpoints"
- "Add input validation to user registration"

---

## Task Breakdown Guidelines

When creating tasks for agents:

### Good Task Breakdown

```bash
bd create "Feature: User Profile" --priority 1
bd create "Design profile data schema" --deps blocks:1 --priority 1
bd create "Create profile API endpoints" --deps blocks:2 --priority 2
bd create "Build profile UI components" --deps blocks:2 --priority 2
bd create "Add profile tests" --deps blocks:3,4 --priority 3
```

**Why this works:**
- Clear dependencies
- Independent verification
- Parallelizable where possible
- Appropriate priorities

### Bad Task Breakdown

```bash
bd create "Build everything for profiles" --priority 1
```

**Why this fails:**
- Too large for single session
- Can't parallelize
- Hard to verify
- Unclear scope

---

## Handling Discovered Work

Agents will discover new tasks during work. Review these carefully:

```bash
# See what was discovered
bd list | grep "discovered-from"

# Review the parent task to understand context
bd show <parent-id>

# Approve or consolidate
# Option 1: Approve as-is
bd update <discovered-id> --priority 2

# Option 2: Consolidate with existing task
bd close <discovered-id> --reason "Duplicate of task 5"
```

---

## Monitoring Commands

Quick reference for checking agent status:

```bash
# What are agents working on right now?
bd list | grep in_progress

# Recent activity across all agents
bd activity --since 30m

# View specific agent output
tmux capture-pane -t <agent>:0 -p | tail -50

# Check if agent is still running
tmux ls | grep <agent>

# Memory health
cm stats

# Task completion rate
bd status
```

---

## Weekly Maintenance

Once per week:

```bash
# 1. Health checks
bd doctor
cm doctor

# 2. Review playbook quality
cm stats
cm stale  # Rules needing feedback

# 3. Clean up old tasks
bd list | grep closed  # Review closed tasks
# Archive if needed

# 4. Review agent performance
bd activity --since 7d  # Week's activity

# 5. Update priorities
# Review backlog and adjust priorities
```

---

## Troubleshooting

### Agent Not Producing Output

```bash
# Attach and check
tmux attach -t <agent>

# Look for errors
tmux capture-pane -t <agent>:0 -p | grep -i error

# Restart if needed
tmux kill-session -t <agent>
tmux new -s <agent>
# Reassign task
```

### Agent Skipped Protocol

```bash
# Check if task was closed
bd show <task-id>

# Check if outcomes were recorded
cm stats  # Look for recent updates

# If protocol was skipped:
# 1. Review the output manually
# 2. Record outcomes yourself
# 3. Note the violation for future prevention
```

### Tasks Stuck in In-Progress

```bash
# See long-running tasks
bd list | grep in_progress

# For each stuck task:
bd show <id>
tmux capture-pane -t <agent>:0 -p > stuck-task-output.txt

# Decide: wait, intervene, or reassign
```

---

## Example Full Day

```bash
# === MORNING (9:00 AM) ===
bd doctor && cm doctor
bd ready --json > ready.json
bd status

# Create task graph
bd create "Add file upload feature" --priority 0
bd create "Design upload API" --deps blocks:1 --priority 1
bd create "Implement S3 integration" --deps blocks:2 --priority 1
bd create "Build upload UI" --deps blocks:2 --priority 1
bd create "Add upload tests" --deps blocks:3,4 --priority 2

# Start team (you're attached, watching all agents)
mux start team ~/dev/my-project

# In Claude pane (top): start design work
# Ctrl+B ↓ to Gemini: gemini "Analyze existing file handling patterns"
# Ctrl+B → to Codex: codex "Implement S3 integration with retry logic"
# Ctrl+B ↑ back to Claude

# Detach if you want to step away: Ctrl+B d

# === MIDDAY CHECK (12:00 PM) ===
tmux attach -t team  # Re-attach if needed
bd activity --since 3h
# Navigate between panes to see progress

# === EVENING (5:00 PM) ===
mkdir -p ~/agent-reviews/$(date +%Y-%m-%d)
cd ~/agent-reviews/$(date +%Y-%m-%d)
tmux capture-pane -t team:agents.0 -p -S - > claude.txt
tmux capture-pane -t team:agents.1 -p -S - > gemini.txt
tmux capture-pane -t team:agents.2 -p -S - > codex.txt

bd status
bd activity --since 8h
cm stats

# Review and approve
cat claude.txt  # Good design doc
cat gemini.txt  # Security analysis complete
cat codex.txt   # S3 integration working

# Cleanup
mux stop team

bd ready --json  # Plan tomorrow
bd sync
```

---

## Best Practices

1. **Health checks first** - Don't waste agent time on broken systems
2. **Clear task breakdown** - One deliverable per task
3. **Match agents to strengths** - Architecture, exploration, implementation
4. **Monitor don't micromanage** - Check-ins, not constant supervision
5. **Review outputs thoroughly** - Verify protocol compliance
6. **Capture everything** - tmux outputs are your record
7. **Clean up daily** - Kill completed sessions, sync state
8. **Trust the protocol** - Agents know what to do

---

## Notes

- This skill assumes you have Claude, Gemini, and Codex CLI tools installed
- All agents must follow the `agent-protocol` skill
- Use `bd sync` at end of day even if agents already synced
- Review captured outputs within 24 hours while context is fresh
- Rejected work should be clearly documented in task notes
- Priorities guide agent choice when multiple tasks are ready
