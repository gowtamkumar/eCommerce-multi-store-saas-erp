import { generateSupplierCode } from './supplier-code.util'

describe('Supplier Code Utility', () => {
  it('should generate a code starting with VND-', () => {
    const code = generateSupplierCode()
    expect(code.startsWith('VND-')).toBe(true)
  })

  it('should generate a code of exact length 10', () => {
    const code = generateSupplierCode()
    expect(code).toHaveLength(10)
  })

  it('should match the expected format VND-[A-Z0-9]{6}', () => {
    const code = generateSupplierCode()
    expect(code).toMatch(/^VND-[A-Z0-9]{6}$/)
  })

  it('should generate unique values', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 100; i++) {
      codes.add(generateSupplierCode())
    }
    expect(codes.size).toBe(100)
  })
})
