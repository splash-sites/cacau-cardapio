// Progressivo (funciona com telefone incompleto) — pra mascarar input em
// tempo real. Celular (DDD + 9 + 4 + 4, 11 dígitos): (xx) x xxxx-xxxx.
// Fixo (DDD + 4 + 4, 10 dígitos, sem o nono dígito): (xx) xxxx-xxxx.
// Distingue os dois pelo 1º dígito do número local (logo após o DDD) — só
// celular começa com 9 no plano de numeração brasileiro.
export function maskPhone(raw: string): string {
  const allDigits = raw.replace(/\D/g, '')
  const isMobile = allDigits[2] === '9'
  const digits = allDigits.slice(0, isMobile ? 11 : 10)

  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`

  if (!isMobile) {
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  if (digits.length <= 3) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`
}
