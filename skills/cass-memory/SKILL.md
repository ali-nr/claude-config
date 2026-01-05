---
name: cass-memory
description: Shared memory system for multi-agent workflows. Get context before tasks, record learnings after completion, and share knowledge across Claude, Gemini, Codex, and other agents. Use PROACTIVELY before starting work and after completing tasks.
---

# CASS Memory - Multi-Agent Learning System

Cross-agent memory sharing between Claude Code, Gemini, Codex, Cursor, Aider, and pi_agent.

**Repository:** https://github.com/Dicklesworthstone/cass_memory_system

## Core Workflow

### Before Starting Work
```bash
cm context "task description" --json
```

Load relevant patterns, rules, and learnings before beginning any task. This pulls cross-agent knowledge.

**Always use --json for machine-readable output** when building automation or parsing results.

### During Work

Add inline feedback in code comments - parsed during reflection:

```javascript
// [cass: helpful b-8f3a2c] This retry pattern worked great
// [cass: harmful b-x7k9p1] This approach caused race conditions
```

### After Completing Work

Record outcomes with specific bullet IDs:

```bash
# Record which specific rules helped
cm outcome success b-123,b-456 --summary "JWT with httpOnly cookies prevented XSS"

# Record which rules led to failure
cm outcome failure b-789 --summary "This caching approach caused stale data issues"

# Apply recorded outcomes to update playbook scores
cm outcome-apply
```

## Essential Commands

| Command | Purpose |
|---------|---------|
| `cm context "task" --json` | Get structured context for parsing |
| `cm context "task"` | Get human-readable context |
| `cm outcome success <ids> --summary "..."` | Record successful rules |
| `cm outcome failure <ids> --summary "..."` | Record failed rules |
| `cm outcome-apply` | Apply recorded outcomes to playbook |
| `cm mark <id> --helpful --reason "why"` | Mark existing rule as helpful |
| `cm mark <id> --harmful --reason "why"` | Mark existing rule as harmful |
| `cm doctor` | Verify CASS health and cross-agent sync |
| `cm stats` | View playbook health dashboard |
| `cm onboard` | Initial playbook building from existing work |
| `cm privacy enable [agents...]` | Enable privacy mode for specific agents |

## Inline Feedback Syntax

Add CASS feedback directly in code during work:

```python
# [cass: helpful b-a1b2c3] This validation pattern caught edge cases
def validate_input(data):
    # [cass: harmful b-x9y8z7] Regex approach was too slow for large inputs
    pass
```

**Syntax:**
- `// [cass: helpful b-<id>] <reason>` - Mark rule as helpful
- `// [cass: harmful b-<id>] <reason>` - Mark rule as harmful

These are parsed during `cm reflect` and automatically update playbook scores.

## Session Outcomes Protocol

After completing work sessions:

```bash
# 1. Record outcomes from the session
cm outcome success b-123,b-456,b-789 --summary "These patterns enabled successful auth implementation"
cm outcome failure b-999 --summary "This caching strategy caused stale data"

# 2. Apply outcomes to update playbook
cm outcome-apply

# 3. Verify results
cm stats
```

## Visualization

```bash
cm stats                     # Health dashboard with scores and metrics
cm playbook list             # All rules with IDs, categories, maturity
cm playbook get <id>         # Detailed view of a single rule
cm top                       # Most effective rules ranked
cm stale                     # Rules without recent feedback
```

### Health Dashboard (`cm stats`)

Shows playbook health at a glance:
```
📊 Playbook Health Dashboard
Total Bullets: N

Score Distribution:
  ⭐ Excellent (>10): N
  ✅ Good (5-10):    N
  ⚪ Neutral (0-5):  N
  ⚠️ At Risk (<0):   N

🏆 Top Performers
👍 Most Helpful
⚠️ At Risk
🕐 Stale
```

### Rule Details (`cm playbook get <id>`)

Shows full details: content, category, kind, maturity, scope, timestamps, scores, and feedback counts.

## Privacy Mode

Control which agents can see specific memory:

```bash
# Enable privacy for specific agents
cm privacy enable claude,gemini

# View privacy settings
cm privacy status

# Disable privacy
cm privacy disable
```

## Onboarding

Build initial playbook from existing work:

```bash
cm onboard
```

This analyzes past commits, code comments, and documentation to bootstrap the playbook.

## Integration with Beads

When working on Beads tasks:

```bash
# Get task context
bd ready --json
cm context "$(bd show <task-id>)" --json

# During work - add inline feedback in code
# [cass: helpful b-xxx] This pattern worked

# After completing task
bd close <task-id> --reason "Feature complete"
cm outcome success b-123,b-456 --summary "Completed task using these patterns"
cm outcome-apply
```

## Multi-Agent Protocol

**Start of work:**
1. Check active task: `bd ready --json`
2. Load context: `cm context "task description" --json`
3. Review retrieved patterns before proceeding

**During work:**
1. Add inline CASS feedback in code comments
2. Use `cm mark <id> --helpful/--harmful` for immediate feedback
3. Track discovered patterns as you work

**End of work:**
1. Record outcomes: `cm outcome success/failure <bullet-ids> --summary "..."`
2. Apply outcomes: `cm outcome-apply`
3. Verify: `cm stats`

## Cross-Agent Memory

CASS automatically shares feedback across all configured agents:
- claude (Claude Code in WezTerm)
- cursor, codex, aider (background tmux sessions)
- pi_agent (if running)
- gemini (tmux session)

When one agent records feedback, all agents benefit on their next context load.

## Health Check

Run weekly or when memory seems stale:
```bash
cm doctor
```

Verifies cross-agent sync and memory integrity.

## Example Session

```bash
# Claude Code starts a task
cm context "refactor API client with error handling" --json
# Reviews past patterns (b-123: use retry logic, b-456: exponential backoff)

# During implementation, adds inline feedback
// [cass: helpful b-123] Retry logic caught network failures
// [cass: helpful b-456] Exponential backoff prevented API throttling

# After completion
cm outcome success b-123,b-456 --summary "Retry patterns prevented 95% of timeout errors"
cm outcome-apply

# Later, Gemini in tmux gets similar task
cm context "add error handling to API" --json
# Sees Claude's learnings about retry logic (now with higher scores)
```

## Auto-Reflection (SessionEnd Hook)

A hook in `~/.claude/settings.json` runs `cm reflect --days 1` after each Claude Code session:

```json
{
  "hooks": {
    "SessionEnd": [
      {
        "hooks": [
          { "type": "command", "command": "cm reflect --days 1" }
        ]
      }
    ]
  }
}
```

This automatically extracts learnings from completed sessions and parses inline feedback.

## Best Practices

1. **Always use --json in automation** - For parsing and agent integration
2. **Be specific in outcomes** - Include what worked and why, not just what
3. **Use inline feedback liberally** - Capture insights as you code
4. **Record both success and failure** - Failures teach more than successes
5. **Apply outcomes immediately** - Don't let feedback accumulate
6. **Run cm stats regularly** - Monitor playbook health
7. **Use bullet IDs precisely** - Reference specific rules, not general topics
8. **Cross-agent memory is powerful** - All agents learn from each attempt

## Notes

- Always call `cm context --json` before significant work
- Record both successes and failures immediately
- Be specific in feedback (include why, not just what)
- Cross-agent memory means all agents learn from each attempt
- Inline feedback comments are parsed during reflection
- Use `cm outcome-apply` after recording outcomes to update scores
