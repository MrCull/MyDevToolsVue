import { readonly, ref } from 'vue'

export type ThemeMode = 'dark' | 'light' | 'system'
type ResolvedTheme = Exclude<ThemeMode, 'system'>

const initialMode = (document.documentElement.dataset.themeMode as ThemeMode | undefined) ?? 'dark'
const mode = ref<ThemeMode>(initialMode)
const resolved = ref<ResolvedTheme>((document.documentElement.dataset.theme as ResolvedTheme | undefined) ?? 'dark')

function resolve(value: ThemeMode): ResolvedTheme {
  return value === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : value
}

function apply(value: ThemeMode) {
  const valueResolved = resolve(value)
  mode.value = value
  resolved.value = valueResolved
  document.documentElement.dataset.themeMode = value
  document.documentElement.dataset.theme = valueResolved
  localStorage.setItem('theme', value)
}

export function useTheme() {
  const cycleTheme = () => apply(mode.value === 'dark' ? 'light' : mode.value === 'light' ? 'system' : 'dark')
  return { mode: readonly(mode), resolved: readonly(resolved), cycleTheme }
}
