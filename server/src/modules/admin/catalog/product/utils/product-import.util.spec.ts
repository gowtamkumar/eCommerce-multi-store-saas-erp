import {
  IMPORT_DESCRIPTION_PLACEHOLDER,
  isMissingImportedDescription,
  slugifyProductName,
} from './product-import.util'

describe('product-import.util', () => {
  it('slugifies product names', () => {
    expect(slugifyProductName('Organic Cotton Tee!')).toBe('organic-cotton-tee')
  })

  it('detects missing imported descriptions', () => {
    expect(isMissingImportedDescription('')).toBe(true)
    expect(isMissingImportedDescription(IMPORT_DESCRIPTION_PLACEHOLDER)).toBe(true)
    expect(isMissingImportedDescription('A full product description with detail.')).toBe(false)
  })
})
