const bytesToBinary = (bytes: Uint8Array) => Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')

export const encodeBase64 = (value: string) => btoa(bytesToBinary(new TextEncoder().encode(value)))

export const decodeBase64 = (value: string) => {
  const normalized = value.replace(/\s/g, '')
  if (!normalized || normalized.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) throw new Error('Invalid Base64 input')
  const binary = atob(normalized)
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)))
}

export const encodeBase64Url = (value: string) => encodeBase64(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  return decodeBase64(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
}
