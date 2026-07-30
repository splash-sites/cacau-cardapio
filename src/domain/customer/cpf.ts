export function normalizeCpf(raw: string): string {
  return raw.replace(/\D/g, '')
}

export function formatCpf(raw: string): string {
  const cpf = normalizeCpf(raw)
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// Progressivo (funciona com CPF incompleto) — pra mascarar input em tempo
// real, diferente de formatCpf que só formata CPF já completo (11 dígitos).
export function maskCpf(raw: string): string {
  const digits = normalizeCpf(raw).slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function checkDigit(base: string, factorStart: number): number {
  let sum = 0
  for (let i = 0; i < base.length; i++) {
    sum += Number(base[i]) * (factorStart - i)
  }
  const rest = (sum * 10) % 11
  return rest === 10 ? 0 : rest
}

export function isValidCpf(raw: string): boolean {
  const cpf = normalizeCpf(raw)
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const digit1 = checkDigit(cpf.slice(0, 9), 10)
  const digit2 = checkDigit(cpf.slice(0, 10), 11)
  return digit1 === Number(cpf[9]) && digit2 === Number(cpf[10])
}
