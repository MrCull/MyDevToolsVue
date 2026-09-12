import { onBeforeUnmount, watch, type Ref } from 'vue'

export function useFocusTrap(open: Ref<boolean>, root: Ref<HTMLElement | null>, close: () => void) {
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { close(); return }
    if (event.key !== 'Tab' || !root.value) return
    const focusable = [...root.value.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  watch(open, (isOpen) => {
    document.removeEventListener('keydown', onKeydown)
    if (isOpen) document.addEventListener('keydown', onKeydown)
  })
  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
}
