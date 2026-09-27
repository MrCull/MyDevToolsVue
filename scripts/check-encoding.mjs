import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const extensions = new Set(['.vue', '.ts', '.js', '.cjs', '.mjs', '.css', '.html', '.md', '.json', '.svg', '.yml', '.yaml'])
const mojibake = /[À-ÿ][\u0080-\u00bf\u2000-\u20ffŒ-ƒˆ-˜]/
const decoder = new TextDecoder('utf-8', { fatal: true })
const files = execFileSync('git', ['ls-files', '-z']).toString('utf8').split('\0').filter(Boolean)
const findings = []

for (const file of files) {
  const extension = file.slice(file.lastIndexOf('.'))
  if (!extensions.has(extension)) continue

  const bytes = readFileSync(file)
  let source
  try {
    source = decoder.decode(bytes)
  } catch {
    findings.push(`${file}: invalid UTF-8`)
    continue
  }

  if (source.charCodeAt(0) === 0xfeff) findings.push(`${file}:1: UTF-8 BOM`)
  source.split(/\r?\n/).forEach((line, index) => {
    if (mojibake.test(line) && !line.includes('encoding-check-ignore')) {
      findings.push(`${file}:${index + 1}: ${line.trim().slice(0, 160)}`)
    }
  })
}

if (findings.length) {
  console.error(`Encoding check failed with ${findings.length} finding(s):\n${findings.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`Encoding check passed (${files.length} tracked files inspected).`)
}
