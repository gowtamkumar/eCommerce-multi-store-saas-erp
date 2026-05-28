import { generateEAN13, generateProductSku, generateVariantSku } from './catalog-id.util'

describe('Catalog ID Utility', () => {
  describe('generateEAN13', () => {
    it('should generate a valid EAN-13 barcode starting with 20', () => {
      const barcode = generateEAN13()
      expect(barcode).toHaveLength(13)
      expect(barcode.startsWith('20')).toBe(true)
      expect(/^\d{13}$/.test(barcode)).toBe(true)

      // Verify standard EAN-13 checksum algorithm
      const digits12 = barcode.substring(0, 12)
      const checkDigit = parseInt(barcode[12], 10)

      let sum = 0
      for (let i = 0; i < 12; i++) {
        const num = parseInt(digits12[i], 10)
        sum += i % 2 === 0 ? num : num * 3
      }
      const calculatedCheckDigit = (10 - (sum % 10)) % 10
      expect(checkDigit).toBe(calculatedCheckDigit)
    })

    it('should generate unique values', () => {
      const generated = new Set<string>()
      for (let i = 0; i < 100; i++) {
        generated.add(generateEAN13())
      }
      // Since it uses crypto.randomInt(0, 10) for 10 digits, collision probability is virtually zero
      expect(generated.size).toBe(100)
    })
  })

  describe('generateProductSku', () => {
    it('should construct SKU with clean uppercase prefix and suffix', () => {
      const sku = generateProductSku('Cotton Polo Shirt!')
      expect(sku).toMatch(/^[A-Z0-9]{8}-[A-Z0-9]{6}$/)
      expect(sku.startsWith('COTTONPO')).toBe(true)
    })

    it('should fall back and pad if name is too short', () => {
      const sku = generateProductSku('Go')
      expect(sku).toMatch(/^GOX-[A-Z0-9]{6}$/)
    })

    it('should support custom prefix and suffix lengths', () => {
      const sku = generateProductSku('Awesome Tea Mug', 5, 4)
      expect(sku).toMatch(/^[A-Z0-9]{5}-[A-Z0-9]{4}$/)
      expect(sku.startsWith('AWESO')).toBe(true)
    })
  })

  describe('generateVariantSku', () => {
    it('should construct SKU with combination values', () => {
      const combination = { Color: 'Navy Blue', Size: 'XL' }
      const sku = generateVariantSku('navy-polo', combination)
      expect(sku).toMatch(/^NAVY-POLO-NAVYBLUE-XL-[A-Z0-9]{6}$/)
    })

    it('should fall back to product slug prefix if combination is empty', () => {
      const sku = generateVariantSku('navy-polo', {})
      expect(sku).toMatch(/^NAVY-POLO-[A-Z0-9]{6}$/)
    })

    it('should support custom suffix length', () => {
      const sku = generateVariantSku('navy-polo', { Color: 'Red' }, 4)
      expect(sku).toMatch(/^NAVY-POLO-RED-[A-Z0-9]{4}$/)
    })
  })
})
