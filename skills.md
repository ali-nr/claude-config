# Skills

Skills provide specialized capabilities. **Always load a skill before using it.**

## How to Use Skills

```
Skill("skill-name")  # Load the skill, then follow its instructions
```

**Do not guess CLI commands.** Load the skill first to get the correct syntax.

---

## Available Skills

### Multi-Agent Workflow
| Skill | Purpose |
|-------|---------|
| `beads` | Task tracking with dependencies (`bd create`, `bd update`, `bd close`, `bd sync`) |
| `run-agent` | Spawn agents in tmux with full protocol (`tmux new -s name`, interactive) |
| `agent-protocol` | Standard protocol ALL agents must follow (START/DURING/END phases) |
| `lead-engineer` | Morning/evening workflows for orchestrating agent teams |
| `tmux` | Direct tmux management for background processes |

### Memory & Context
| Skill | Purpose |
|-------|---------|
| `cass-memory` | Get context before work, record outcomes after completion |

**Common commands:**
- `cm context "task" --json` - Get CASS memory context before work
- `cm outcome success <ids> --summary "..."` - Record successful patterns
- `cm outcome-apply` - Apply recorded outcomes to playbook
- `cm mark <id> --helpful/--harmful` - Give feedback on existing rules

### Development
| Skill | Purpose |
|-------|---------|
| `skill-creator` | Create new skills that extend Claude's capabilities |

---

## Skill Discovery

To see all available skills:
```bash
ls ~/.claude/skills/*/SKILL.md
```

To manually read a skill (if Skill() unavailable):
```bash
cat ~/.claude/skills/<name>/SKILL.md
```
