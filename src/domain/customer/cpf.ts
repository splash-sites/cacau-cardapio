export function normalizeCpf(raw: string): string {
  return raw.replace(/\D/g, '')
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
