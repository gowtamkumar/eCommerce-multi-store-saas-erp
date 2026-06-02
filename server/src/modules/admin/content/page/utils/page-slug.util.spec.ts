import { normalizePageSlug } from './page-slug.util'

describe('normalizePageSlug', () => {
  it('should return empty string if isHomePage is true', () => {
    expect(normalizePageSlug('any-slug', true)).toBe('')
  })

  it('should return empty string if slug is not provided', () => {
    expect(normalizePageSlug(null)).toBe('')
    expect(normalizePageSlug(undefined)).toBe('')
    expect(normalizePageSlug('')).toBe('')
  })

  it('should normalize and clean unsafe characters', () => {
    expect(normalizePageSlug('About Us!')).toBe('about-us')
    expect(normalizePageSlug('FAQ & Support')).toBe('faq-support')
    expect(normalizePageSlug('  My Blog ')).toBe('my-blog')
    expect(normalizePageSlug('100% Organic')).toBe('100-organic')
    expect(normalizePageSlug('(Home Page)')).toBe('home-page')
    expect(normalizePageSlug('///multiple-slashes///')).toBe('multiple-slashes')
    expect(normalizePageSlug('accented-é-characters')).toBe('accented-e-characters')
  })
})
