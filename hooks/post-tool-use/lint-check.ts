/**
 * PostToolUse Hook - Runs after Claude Code uses a tool (Edit, Write, Bash, etc.)
 *
 * Communication pattern:
 * - Input: Claude pipes hook context as JSON to stdin
 * - Output: Hook writes JSON response to stdout with `decision` and optionally `reason`
 *
 * Why Bun?
 * - Fast startup: Executes TypeScript directly without compilation
 * - Built-in APIs: Clean ergonomic APIs for stdin/stdout and process spawning
 */
import type { PostToolUseHookInput } from '@anthropic-ai/claude-agent-sdk'
import { existsSync } from 'fs'
import { join } from 'path'

// File extensions that should trigger linting
const LINTABLE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx',
  '.mjs', '.cjs', '.mts', '.cts',
])

/**
 * Check if a file path has a lintable extension
 */
function isLintableFile(filePath: string | undefined): boolean {
  if (!filePath) return false
  const ext = filePath.slice(filePath.lastIndexOf('.'))
  return LINTABLE_EXTENSIONS.has(ext)
}

/**
 * Check if the project has a lint script in package.json
 */
async function hasLintScript(cwd: string): Promise<boolean> {
  const packageJsonPath = join(cwd, 'package.json')
  if (!existsSync(packageJsonPath)) return false

  try {
    const content = await Bun.file(packageJsonPath).text()
    const packageJson = JSON.parse(content)
    return !!packageJson?.scripts?.lint
  } catch {
    return false
  }
}

// Read the JSON payload that Claude Code pipes via stdin
// Contains info about what tool was used, working directory, etc.
const input: PostToolUseHookInput = await Bun.stdin.json()

// Extract file path from tool input (Edit and Write tools use file_path)
const toolInput = input.tool_input as { file_path?: string } | undefined
const filePath = toolInput?.file_path

// Skip linting for non-JS/TS files
if (!isLintableFile(filePath)) {
  // Silent pass-through for non-lintable files
  process.exit(0)
}

// Skip if project doesn't have a lint script
if (!(await hasLintScript(input.cwd))) {
  // Silent pass-through when no lint script exists
  process.exit(0)
}

// Run linting synchronously in the project directory
// This checks if code still passes linting after Claude made changes
const result = Bun.spawnSync(['bun', 'lint'], { cwd: input.cwd })

// If linting fails, block the action and report errors back to Claude
if (result.exitCode !== 0) {
  const stdout = result.stdout.toString()
  const stderr = result.stderr.toString()
  const output = [stdout, stderr].filter(Boolean).join('\n').trim()

  // Output JSON with decision: 'block' tells Claude Code the action was problematic
  // The reason is shown to Claude so it can fix the lint errors
  await Bun.write(
    Bun.stdout,
    JSON.stringify({
      decision: 'block',
      reason: `Linting failed. Please fix errors:\n\n${output}`,
    })
  )
  process.exit(0) //JSON output is only processed when the hook exits with code 0. If your hook exits with code 2 (blocking error), stderr text is used directly—any JSON in stdout is ignored. For other non-zero exit codes, only stderr is shown to the user in verbose mode (ctrl+o).
}

// If linting passes, no JSON response needed - Claude continues normally
console.log('Lint passed')
