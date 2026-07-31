export function normalizeZipCode(raw: string): string {
  return raw.replace(/\D/g, '')
}

// Progressivo (funciona com CEP incompleto) — pra mascarar input em tempo
// real. Formato 00000-000.
export function maskZipCode(raw: string): string {
  const digits = normalizeZipCode(raw).slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}
