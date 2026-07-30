export function isOrderFromToday(createdAt: string, now: Date = new Date()): boolean {
  const orderDate = new Date(createdAt)
  return (
    orderDate.getFullYear() === now.getFullYear() &&
    orderDate.getMonth() === now.getMonth() &&
    orderDate.getDate() === now.getDate()
  )
}
