import { csvRow, escapeCsvCell, isSuccessfulPaymentStatus } from './report-export.util'

describe('Report Export Utility', () => {
  describe('isSuccessfulPaymentStatus', () => {
    it.each(['completed', 'COMPLETED', 'paid', 'PAID', 'SUCCESS', 'success'])(
      'treats %s as successful',
      (status) => {
        expect(isSuccessfulPaymentStatus(status)).toBe(true)
      },
    )

    it.each(['pending', 'failed', '', null, undefined])(
      'does not treat %s as successful',
      (status) => {
        expect(isSuccessfulPaymentStatus(status)).toBe(false)
      },
    )
  })

  describe('escapeCsvCell', () => {
    it('quotes fields with commas, quotes, or newlines', () => {
      expect(escapeCsvCell('ACME, "North"\nStore')).toBe('"ACME, ""North""\nStore"')
    })

    it('neutralizes spreadsheet formula injection', () => {
      expect(escapeCsvCell('=IMPORTXML("https://example.com")')).toBe(
        `"'=IMPORTXML(""https://example.com"")"`,
      )
    })

    it('does not neutralize numeric negative values', () => {
      expect(escapeCsvCell(-100)).toBe('-100')
    })

    it('keeps nullish values empty', () => {
      expect(escapeCsvCell(null)).toBe('')
      expect(escapeCsvCell(undefined)).toBe('')
    })
  })

  describe('csvRow', () => {
    it('serializes a row with escaped cells', () => {
      expect(csvRow(['Date', 'Reference, Name', 100])).toBe('Date,"Reference, Name",100\n')
    })
  })
})
