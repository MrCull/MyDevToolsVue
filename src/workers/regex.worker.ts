interface Request {
  id: number
  pattern: string
  flags: string
  text: string
  replacement: string
}

interface MatchResult {
  index: number
  value: string
  captures: (string | undefined)[]
  groups: Record<string, string | undefined>
}

self.onmessage = (event: MessageEvent<Request>) => {
  const { id, pattern, flags, text, replacement } = event.data
  try {
    const expression = new RegExp(pattern, flags)
    const matches: MatchResult[] = []
    if (flags.includes('g')) {
      for (const match of text.matchAll(expression)) {
        matches.push({ index: match.index, value: match[0], captures: [...match].slice(1), groups: match.groups ?? {} })
        if (matches.length === 1000) break
      }
    } else {
      const match = expression.exec(text)
      if (match) matches.push({ index: match.index, value: match[0], captures: [...match].slice(1), groups: match.groups ?? {} })
    }
    const replaceExpression = new RegExp(pattern, flags)
    self.postMessage({ id, matches, replacement: text.replace(replaceExpression, replacement) })
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : String(error) })
  }
}
