import { sanitizeAuditValue } from './audit-log-sanitizer.util'

describe('sanitizeAuditValue', () => {
  it('redacts sensitive fields recursively', () => {
    const sanitized = sanitizeAuditValue({
      username: 'staff',
      password: 'secret',
      profile: {
        currentPassword: 'old',
        nested: [{ refreshToken: 'refresh-token' }, { value: 'kept' }],
      },
    })

    expect(sanitized).toEqual({
      username: 'staff',
      password: '[REDACTED]',
      profile: {
        currentPassword: '[REDACTED]',
        nested: [{ refreshToken: '[REDACTED]' }, { value: 'kept' }],
      },
    })
  })

  it('redacts keys containing password regardless of casing', () => {
    expect(
      sanitizeAuditValue({
        confirmPassword: 'secret',
        temporaryPASSWORD: 'secret',
      }),
    ).toEqual({
      confirmPassword: '[REDACTED]',
      temporaryPASSWORD: '[REDACTED]',
    })
  })

  it('leaves primitive values untouched', () => {
    expect(sanitizeAuditValue(null)).toBeNull()
    expect(sanitizeAuditValue('plain')).toBe('plain')
  })
})
