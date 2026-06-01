import {
  InvalidCustomDomainError,
  generateVerificationToken,
  normalizeCustomDomain,
  verifyDomainOwnership,
} from './custom-domain.util'

describe('custom-domain.util', () => {
  describe('normalizeCustomDomain', () => {
    it('lowercases and strips schemes/paths/ports', () => {
      expect(normalizeCustomDomain('HTTPS://Shop.Example.com/store')).toBe('shop.example.com')
      expect(normalizeCustomDomain('  http://example.com:8443/')).toBe('example.com')
    })

    it('rejects reserved hostnames', () => {
      expect(() => normalizeCustomDomain('localhost')).toThrow(InvalidCustomDomainError)
      expect(() => normalizeCustomDomain('127.0.0.1')).toThrow(InvalidCustomDomainError)
    })

    it('rejects malformed hostnames', () => {
      expect(() => normalizeCustomDomain('not a domain')).toThrow(InvalidCustomDomainError)
      expect(() => normalizeCustomDomain('-leading.com')).toThrow(InvalidCustomDomainError)
      expect(() => normalizeCustomDomain('a'.repeat(300))).toThrow(InvalidCustomDomainError)
    })

    it('rejects single-label hostnames', () => {
      expect(() => normalizeCustomDomain('example')).toThrow(InvalidCustomDomainError)
    })
  })

  describe('generateVerificationToken', () => {
    it('returns a 32-char hex token', () => {
      const token = generateVerificationToken()
      expect(token).toMatch(/^[a-f0-9]{32}$/)
    })

    it('returns distinct tokens', () => {
      expect(generateVerificationToken()).not.toBe(generateVerificationToken())
    })
  })

  describe('verifyDomainOwnership', () => {
    it('verifies when TXT record matches', async () => {
      const resolver = {
        resolveTxt: jest.fn().mockResolvedValue([['expected-token']]),
      }
      const result = await verifyDomainOwnership('example.com', 'expected-token', resolver)
      expect(result.verified).toBe(true)
      expect(resolver.resolveTxt).toHaveBeenCalledWith('_omnicart-verify.example.com')
    })

    it('does not verify when TXT record mismatches', async () => {
      const resolver = {
        resolveTxt: jest.fn().mockResolvedValue([['wrong-token']]),
      }
      const result = await verifyDomainOwnership('example.com', 'expected-token', resolver)
      expect(result.verified).toBe(false)
    })

    it('joins chunked TXT segments correctly', async () => {
      const resolver = {
        resolveTxt: jest.fn().mockResolvedValue([['part1', 'part2']]),
      }
      const result = await verifyDomainOwnership('example.com', 'part1part2', resolver)
      expect(result.verified).toBe(true)
    })

    it('returns error info when resolution fails', async () => {
      const resolver = {
        resolveTxt: jest.fn().mockRejectedValue(Object.assign(new Error('not found'), { code: 'ENOTFOUND' })),
      }
      const result = await verifyDomainOwnership('example.com', 'expected-token', resolver)
      expect(result.verified).toBe(false)
      expect(result.error).toBe('ENOTFOUND')
    })

    it('refuses to verify when token is missing', async () => {
      const resolver = { resolveTxt: jest.fn() }
      const result = await verifyDomainOwnership('example.com', '', resolver)
      expect(result.verified).toBe(false)
      expect(resolver.resolveTxt).not.toHaveBeenCalled()
    })
  })
})
