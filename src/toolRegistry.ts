import type { Component } from 'vue'
import BranchFormatter from './components/BranchFormatter.vue'
import ContainerGenerator from './components/ContainerGenerator.vue'
import CronGenerator from './components/CronGenerator.vue'
import CSharpFormatter from './components/CSharpFormatter.vue'
import DiffTool from './components/DiffTool.vue'
import GuidGenerator from './components/GuidGenerator.vue'
import HashGenerator from './components/HashGenerator.vue'
import JsonFormatter from './components/JsonFormatter.vue'
import NumberBaseConverter from './components/NumberBaseConverter.vue'
import PasswordGenerator from './components/PasswordGenerator.vue'
import QRCodeGenerator from './components/QRCodeGenerator.vue'
import RandomNumbers from './components/RandomNumbers.vue'
import SqlFormatter from './components/SqlFormatter.vue'
import TimeZoneConverter from './components/TimeZoneConverter.vue'
import ToDoList from './components/ToDoList.vue'
import UnitConverter from './components/UnitConverter.vue'

export type ToolCategory = 'Formatters' | 'Generators' | 'Converters' | 'Productivity'

export interface ToolDefinition {
  id: string
  path: string
  name: string
  shortName: string
  description: string
  category: ToolCategory
  icon: string
  keywords: string[]
  component: Component
}

export const toolCategories: ToolCategory[] = ['Formatters', 'Generators', 'Converters', 'Productivity']

export const tools: ToolDefinition[] = [
  { id: 'json', path: '/json', name: 'JSON Formatter', shortName: 'JSON', description: 'Format, validate, and inspect JSON documents.', category: 'Formatters', icon: '{}', keywords: ['json', 'validate', 'pretty print', 'api'], component: JsonFormatter },
  { id: 'sql', path: '/sql', name: 'SQL Formatter', shortName: 'SQL', description: 'Make SQL queries clean and readable.', category: 'Formatters', icon: 'SQL', keywords: ['sql', 'query', 'database', 'format'], component: SqlFormatter },
  { id: 'csharp', path: '/csharp', name: 'C# Formatter', shortName: 'C#', description: 'Format C# code with consistent indentation.', category: 'Formatters', icon: 'C#', keywords: ['csharp', 'dotnet', 'code', 'format'], component: CSharpFormatter },
  { id: 'diff', path: '/diff', name: 'Diff Tool', shortName: 'Diff', description: 'Compare two pieces of text side by side.', category: 'Formatters', icon: '↔', keywords: ['diff', 'compare', 'text', 'changes'], component: DiffTool },
  { id: 'branch', path: '/branch', name: 'Branch Formatter', shortName: 'Branch', description: 'Turn a title into a tidy Git branch name.', category: 'Formatters', icon: '⌘', keywords: ['git', 'branch', 'slug', 'format'], component: BranchFormatter },
  { id: 'container', path: '/container', name: 'Container Generator', shortName: 'Container', description: 'Generate container numbers for testing.', category: 'Generators', icon: '▣', keywords: ['container', 'shipping', 'number', 'generate'], component: ContainerGenerator },
  { id: 'guid', path: '/guid', name: 'GUID Generator', shortName: 'GUID', description: 'Create UUIDs in the format you need.', category: 'Generators', icon: '◎', keywords: ['guid', 'uuid', 'identifier', 'random'], component: GuidGenerator },
  { id: 'password', path: '/password', name: 'Password Generator', shortName: 'Password', description: 'Create strong, configurable passwords.', category: 'Generators', icon: '✦', keywords: ['password', 'security', 'random', 'secret'], component: PasswordGenerator },
  { id: 'hash', path: '/hash', name: 'Hash Generator', shortName: 'Hash', description: 'Calculate common hashes for text.', category: 'Generators', icon: '#', keywords: ['hash', 'sha', 'md5', 'checksum'], component: HashGenerator },
  { id: 'qrcode', path: '/qrcode', name: 'QR Code Generator', shortName: 'QR Code', description: 'Create a QR code from text or a URL.', category: 'Generators', icon: '▦', keywords: ['qr', 'qrcode', 'barcode', 'url'], component: QRCodeGenerator },
  { id: 'cron', path: '/cron', name: 'Cron Generator', shortName: 'Cron', description: 'Build cron expressions with confidence.', category: 'Generators', icon: '◷', keywords: ['cron', 'schedule', 'expression', 'timer'], component: CronGenerator },
  { id: 'randomnumbers', path: '/randomnumbers', name: 'Random Numbers', shortName: 'Random', description: 'Generate random numbers in a chosen range.', category: 'Generators', icon: '⠿', keywords: ['random', 'numbers', 'dice', 'range'], component: RandomNumbers },
  { id: 'timezone', path: '/timezone', name: 'Time Zone Converter', shortName: 'Time Zone', description: 'Convert a time between time zones.', category: 'Converters', icon: '◐', keywords: ['time', 'timezone', 'date', 'utc'], component: TimeZoneConverter },
  { id: 'numberbase', path: '/numberbase', name: 'Number Base Converter', shortName: 'Number Base', description: 'Convert decimal, binary, hexadecimal, and more.', category: 'Converters', icon: '₁₂', keywords: ['binary', 'hex', 'decimal', 'number', 'base'], component: NumberBaseConverter },
  { id: 'unit', path: '/unit', name: 'Unit Converter', shortName: 'Unit', description: 'Convert common measurements quickly.', category: 'Converters', icon: '↗', keywords: ['unit', 'measurement', 'length', 'weight'], component: UnitConverter },
  { id: 'todo', path: '/todo', name: 'To Do List', shortName: 'To Do', description: 'Keep a lightweight list of focused tasks.', category: 'Productivity', icon: '✓', keywords: ['todo', 'tasks', 'checklist', 'productivity'], component: ToDoList }
]

export const toolsByCategory = (category: ToolCategory) => tools.filter((tool) => tool.category === category)
