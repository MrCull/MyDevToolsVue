import { parseDelimited, recordsToDelimited, serializeDelimited } from './csv'

export type DataFormat = 'json' | 'yaml' | 'csv' | 'tsv' | 'xml'

const scalar = (value: string): unknown => {
  const trimmed = value.trim()
  if (trimmed === 'null') return null
  if (trimmed === 'true' || trimmed === 'false') return trimmed === 'true'
  if (trimmed && !Number.isNaN(Number(trimmed))) return Number(trimmed)
  return trimmed.replace(/^(['"])(.*)\1$/, '$2')
}

const parseYaml = (source: string) => {
  if (/^---/m.test(source.trim().replace(/^---\s*/, ''))) throw new Error('YAML multi-document input is not supported')
  const result: Record<string, unknown> = {}
  let activeList: unknown[] | null = null
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || line === '---') continue
    if (line.startsWith('- ')) {
      if (!activeList) throw new Error('List item has no parent key')
      activeList.push(scalar(line.slice(2)))
      continue
    }
    const match = /^([^:]+):(?:\s*(.*))?$/.exec(line)
    if (!match) throw new Error(`Invalid line: ${line}`)
    const [, key, value = ''] = match
    if (!value) { activeList = []; result[key.trim()] = activeList }
    else { activeList = null; result[key.trim()] = scalar(value) }
  }
  return result
}
const yamlValue = (value: unknown, indent = ''): string => {
  if (Array.isArray(value)) return value.map((item) => typeof item === 'object' ? `${indent}- ${JSON.stringify(item)}` : `${indent}- ${String(item)}`).join('\n')
  if (value && typeof value === 'object') return Object.entries(value).map(([key, item]) => item && typeof item === 'object' ? `${indent}${key}:\n${yamlValue(item, `${indent}  `)}` : `${indent}${key}: ${String(item)}`).join('\n')
  return String(value)
}

const nodeToValue = (element: Element): unknown => {
  const children = [...element.children]
  const attributes = Object.fromEntries([...element.attributes].map((attribute) => [`@_${attribute.name}`, attribute.value]))
  if (!children.length) return Object.keys(attributes).length ? { '#text': element.textContent ?? '', ...attributes } : element.textContent ?? ''
  const result: Record<string, unknown> = { ...attributes }
  children.forEach((child) => {
    const value = nodeToValue(child)
    const current = result[child.tagName]
    result[child.tagName] = current === undefined ? value : Array.isArray(current) ? [...current, value] : [current, value]
  })
  return result
}
const parseXml = (source: string) => {
  const document = new DOMParser().parseFromString(source, 'application/xml')
  const issue = document.querySelector('parsererror')
  if (issue) throw new Error(issue.textContent || 'Invalid XML')
  return { [document.documentElement.tagName]: nodeToValue(document.documentElement) }
}
const xmlNode = (name: string, value: unknown): string => {
  if (Array.isArray(value)) return value.map((item) => xmlNode(name, item)).join('')
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const attrs = Object.entries(record).filter(([key]) => key.startsWith('@_')).map(([key, item]) => ` ${key.slice(2)}="${String(item)}"`).join('')
    const text = record['#text'] == null ? '' : String(record['#text'])
    const children = Object.entries(record).filter(([key]) => !key.startsWith('@_') && key !== '#text').map(([key, item]) => xmlNode(key, item)).join('')
    return `<${name}${attrs}>${text}${children}</${name}>`
  }
  return `<${name}>${value == null ? '' : String(value)}</${name}>`
}

export const parseData = (format: DataFormat, source: string, header = true): unknown => {
  if (format === 'json') return JSON.parse(source)
  if (format === 'yaml') return parseYaml(source)
  if (format === 'xml') return parseXml(source)
  const rows = parseDelimited(source, format === 'tsv' ? '\t' : ',')
  if (!header) return rows
  const [columns = [], ...values] = rows
  return values.map((row) => Object.fromEntries(columns.map((column, index) => [column, row[index] ?? ''])))
}

export const serializeData = (format: DataFormat, value: unknown, indent: string | number = 2): string => {
  if (format === 'json') return JSON.stringify(value, null, indent)
  if (format === 'yaml') return `${yamlValue(value)}\n`
  if (format === 'xml') {
    const record = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : { root: value }
    return Object.keys(record).length === 1 ? xmlNode(Object.keys(record)[0], Object.values(record)[0]) : xmlNode('root', record)
  }
  if (!Array.isArray(value)) throw new Error('CSV output needs an array of objects')
  const delimiter = format === 'tsv' ? '\t' : ','
  if (value.every((row) => Array.isArray(row))) return serializeDelimited(value as unknown[][], delimiter)
  if (!value.every((row) => row && typeof row === 'object' && !Array.isArray(row))) throw new Error('CSV output needs an array of objects')
  return recordsToDelimited(value as Record<string, unknown>[], delimiter)
}
export const isFlatRecordArray = (value: unknown): value is Record<string, unknown>[] => Array.isArray(value) && value.every((row) => row && typeof row === 'object' && !Array.isArray(row) && Object.values(row).every((cell) => cell == null || typeof cell !== 'object'))
