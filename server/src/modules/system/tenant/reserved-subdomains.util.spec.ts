import {
  InvalidSubdomainError,
  isReservedSubdomain,
  normalizeSubdomain,
} from './reserved-subdomains.util'

describe('reserved-subdomains.util', () => {
  describe('normalizeSubdomain', () => {
    it('trims and lowercases a valid subdomain', () => {
      expect(normalizeSubdomain('  MyStore ')).toBe('mystore')
      expect(normalizeSubdomain('acme-shop')).toBe('acme-shop')
    })

    it('rejects reserved subdomains', () => {
      expect(() => normalizeSubdomain('admin')).toThrow(InvalidSubdomainError)
      expect(() => normalizeSubdomain('API')).toThrow(InvalidSubdomainError)
      expect(() => normalizeSubdomain('www')).toThrow(InvalidSubdomainError)
      expect(() => normalizeSubdomain('support')).toThrow(InvalidSubdomainError)
    })

    it('rejects malformed subdomains', () => {
      expect(() => normalizeSubdomain('')).toThrow(InvalidSubdomainError)
      expect(() => normalizeSubdomain('-leading')).toThrow(InvalidSubdomainError)
      expect(() => normalizeSubdomain('trailing-')).toThrow(InvalidSubdomainError)
      expect(() => normalizeSubdomain('has space')).toThrow(InvalidSubdomainError)
      expect(() => normalizeSubdomain('has.dot')).toThrow(InvalidSubdomainError)
      expect(() => normalizeSubdomain('a'.repeat(64))).toThrow(InvalidSubdomainError)
    })
  })

  describe('isReservedSubdomain', () => {
    it('is case-insensitive', () => {
      expect(isReservedSubdomain('Admin')).toBe(true)
      expect(isReservedSubdomain('my-store')).toBe(false)
    })
  })
})
