// Simple TypeScript Calculator - No Dependencies

// Basic arithmetic operations
export function add(a: number, b: number): number {
  return a + b
}

export function subtract(a: number, b: number): number {
  return a - b
}

export function multiply(a: number, b: number): number {
  return a * b
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero is not allowed')
  }
  return a / b
}

// Power and root operations
export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent)
}

export function squareRoot(n: number): number {
  if (n < 0) {
    throw new Error('Square root of negative number is not supported')
  }
  return Math.sqrt(n)
}

// Utility functions
export function absolute(n: number): number {
  return Math.abs(n)
}

export function round(n: number, decimals = 0): number {
  const factor = Math.pow(10, decimals)
  return Math.round(n * factor) / factor
}

// Simple array operations
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0)
}

export function average(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('Cannot calculate average of empty array')
  }
  return sum(numbers) / numbers.length
}

// Percentage calculation
export function percentage(part: number, whole: number): number {
  if (whole === 0) {
    throw new Error('Cannot calculate percentage with zero as whole')
  }
  return (part / whole) * 100
}
