/**
 * Best Practices Hook - Triggers Context7 research when "best practice/s" is mentioned
 *
 * Simple hook that encourages live documentation research when users
 * ask about best practices for any technology.
 */

async function getUserPrompt(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(chunk)
  }
  try {
    const data = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
    return data.prompt || ''
  } catch {
    return ''
  }
}

function mentionsBestPractices(prompt: string): boolean {
  return /best\s*practices?/i.test(prompt)
}

// Main
const userPrompt = await getUserPrompt()

if (mentionsBestPractices(userPrompt)) {
  console.log(`
[Best Practices Research]
You mentioned "best practices" - consider using Context7 for up-to-date documentation.

Would you like me to:
1. Search Context7 for current best practices on the relevant technology?
2. Proceed with my existing knowledge?

To search, I'll use mcp__context7__resolve-library-id → mcp__context7__get-library-docs`)
}
