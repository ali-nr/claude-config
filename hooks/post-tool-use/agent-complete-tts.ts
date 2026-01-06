/**
 * PostToolUse Hook - Agent Completion TTS
 *
 * Purpose: Announce when Task (agent) tool completes
 * Triggers: After Task tool execution
 */
import type { PostToolUseHookInput } from '@anthropic-ai/claude-agent-sdk'
import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const input: PostToolUseHookInput = await Bun.stdin.json()

// Only trigger for Task tool completions
if (input.tool_name !== 'Task') {
  process.exit(0)
}

// Check if muted
const muteFlag = join(homedir(), '.claude', 'agentvibes-muted')
const projectMuteFlag = join(process.cwd(), '.claude', 'agentvibes-muted')
if (existsSync(muteFlag) || existsSync(projectMuteFlag)) {
  process.exit(0)
}

// Extract agent info from tool input if available
const toolInput = (input as any).tool_input || {}
const description = toolInput.description || 'Agent task'
const subagentType = toolInput.subagent_type || 'unknown'

// Create short summary message
const message = `${subagentType} agent finished: ${description}`.slice(0, 120)

// Play TTS
const ttsScript = join(homedir(), '.claude', 'hooks', 'play-tts.sh')
if (existsSync(ttsScript)) {
  spawnSync('bash', [ttsScript, message], {
    stdio: 'inherit',
    env: { ...process.env }
  })
}

process.exit(0)
