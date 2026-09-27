const quote = (value: unknown, delimiter: string) => {
  const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  return text.includes(delimiter) || /["\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export const parseDelimited = (source: string, delimiter = ','): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (quoted && character === '"' && source[index + 1] === '"') { cell += '"'; index += 1 }
    else if (character === '"') quoted = !quoted
    else if (!quoted && character === delimiter) { row.push(cell); cell = '' }
    else if (!quoted && (character === '\n' || character === '\r')) {
      if (character === '\r' && source[index + 1] === '\n') index += 1
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += character
  }
  if (quoted) throw new Error('Unclosed quoted field')
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows
}

export const serializeDelimited = (rows: unknown[][], delimiter = ',') => rows.map((row) => row.map((cell) => quote(cell, delimiter)).join(delimiter)).join('\n')

export const recordsToDelimited = (records: Record<string, unknown>[], delimiter = ',') => {
  const columns = [...new Set(records.flatMap((record) => Object.keys(record)))]
  return serializeDelimited([columns, ...records.map((record) => columns.map((column) => record[column]))], delimiter)
}
