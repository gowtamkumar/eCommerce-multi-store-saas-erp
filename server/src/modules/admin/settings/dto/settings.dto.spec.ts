import { validate } from 'class-validator'
import { UpdateSiteSettingsDto } from './settings.dto'

describe('UpdateSiteSettingsDto Validation', () => {
  it('should pass validation with valid values', async () => {
    const dto = new UpdateSiteSettingsDto()
    dto.contactEmail = 'test@example.com'
    dto.currency = 'USD'
    dto.timezone = 'America/New_York'
    dto.locale = 'en-US'
    dto.defaultBranchId = '123e4567-e89b-12d3-a456-426614174000'

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should pass validation when optional values are empty strings', async () => {
    const dto = new UpdateSiteSettingsDto()
    dto.contactEmail = ''
    dto.currency = ''
    dto.timezone = ''
    dto.locale = ''
    dto.defaultBranchId = ''

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should pass validation when optional values are null', async () => {
    const dto = new UpdateSiteSettingsDto()
    dto.contactEmail = null as any
    dto.currency = null as any
    dto.timezone = null as any
    dto.locale = null as any
    dto.defaultBranchId = null as any

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should fail validation with invalid values', async () => {
    const dto = new UpdateSiteSettingsDto()
    dto.contactEmail = 'invalid-email'
    dto.currency = 'invalid-currency'
    dto.timezone = 'invalid-timezone'
    dto.locale = 'invalid-locale'
    dto.defaultBranchId = 'invalid-uuid'

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })
})
