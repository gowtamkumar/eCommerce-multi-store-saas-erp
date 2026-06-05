import { sanitizePageHtml, validateAndSanitizeSections } from './page-html-sanitizer.util'

describe('page-html-sanitizer', () => {
  it('removes script tags and event handlers', () => {
    const input = '<p onclick="alert(1)">Hi</p><script>alert(1)</script>'
    const out = sanitizePageHtml(input)
    expect(out).not.toContain('<script')
    expect(out).not.toContain('onclick')
    expect(out).toContain('<p')
  })

  it('sanitizes nested section settings', () => {
    const sections = validateAndSanitizeSections([
      {
        id: 'a',
        type: 'text-block',
        settings: { html: '<img src=x onerror=alert(1)>' },
      },
    ])
    expect(sections[0].settings?.html).not.toContain('onerror')
  })

  it('rejects overly deep trees', () => {
    let node: any = { id: 'leaf', type: 'heading', settings: {} }
    for (let i = 0; i < 15; i++) {
      node = { id: `n${i}`, type: 'section', settings: {}, children: [node] }
    }
    expect(() => validateAndSanitizeSections([node])).toThrow(/depth/)
  })
})
