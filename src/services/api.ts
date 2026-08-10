export const requestDelay = 140

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function mockRequest<T>(value: T, delay = requestDelay): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(value)), delay)
  })
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}