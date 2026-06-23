import { BadRequestException } from '@nestjs/common'
import { AddressValidationService } from './address-validation.service'

describe('AddressValidationService', () => {
  let service: AddressValidationService

  beforeEach(() => {
    service = new AddressValidationService()
  })

  it('should pass and skip validation for local BD addresses', async () => {
    const bdDto = {
      recipientName: 'Gowtam Kumar',
      phone: '+8801700000000',
      address: 'House 12, Road 5, Dhanmondi',
      country: 'BD',
    }
    const result = await service.validateAddress(bdDto)
    expect(result.success).toBe(true)
  })

  it('should throw BadRequestException if city is missing for international address', async () => {
    const dto = {
      recipientName: 'John Doe',
      phone: '+15551234567',
      address: '123 Main St',
      country: 'US',
      state: 'NY',
      postalCode: '10001',
      city: '',
    }
    await expect(service.validateAddress(dto)).rejects.toThrow(BadRequestException)
    await expect(service.validateAddress(dto)).rejects.toThrow('City is required')
  })

  it('should throw BadRequestException if state is missing for international address', async () => {
    const dto = {
      recipientName: 'John Doe',
      phone: '+15551234567',
      address: '123 Main St',
      country: 'US',
      city: 'New York',
      postalCode: '10001',
      state: '',
    }
    await expect(service.validateAddress(dto)).rejects.toThrow(BadRequestException)
    await expect(service.validateAddress(dto)).rejects.toThrow('State/Region is required')
  })

  it('should throw BadRequestException if postal code is missing for international address', async () => {
    const dto = {
      recipientName: 'John Doe',
      phone: '+15551234567',
      address: '123 Main St',
      country: 'US',
      city: 'New York',
      state: 'NY',
      postalCode: '',
    }
    await expect(service.validateAddress(dto)).rejects.toThrow(BadRequestException)
    await expect(service.validateAddress(dto)).rejects.toThrow('Postal code is required')
  })

  describe('US Zip Code Validation', () => {
    it('should pass for valid 5-digit zip code', async () => {
      const dto = {
        recipientName: 'John Doe',
        phone: '+15551234567',
        address: '123 Main St',
        country: 'US',
        city: 'New York',
        state: 'ny',
        postalCode: '10001',
      }
      const result = await service.validateAddress(dto)
      expect(result.success).toBe(true)
      expect(result.formattedAddress.postalCode).toBe('10001')
      expect(result.formattedAddress.state).toBe('NY')
    })

    it('should pass for valid 5+4-digit zip code', async () => {
      const dto = {
        recipientName: 'John Doe',
        phone: '+15551234567',
        address: '123 Main St',
        country: 'US',
        city: 'New York',
        state: 'NY',
        postalCode: '10001-1234',
      }
      const result = await service.validateAddress(dto)
      expect(result.success).toBe(true)
    })

    it('should throw BadRequestException for invalid zip codes', async () => {
      const dto = {
        recipientName: 'John Doe',
        phone: '+15551234567',
        address: '123 Main St',
        country: 'US',
        city: 'New York',
        state: 'NY',
        postalCode: '1000',
      }
      await expect(service.validateAddress(dto)).rejects.toThrow(BadRequestException)
    })
  })

  describe('Canada Postal Code Validation', () => {
    it('should pass for valid CA postal code', async () => {
      const dto = {
        recipientName: 'Bob Smith',
        phone: '+15559876543',
        address: '456 Queen St',
        country: 'CA',
        city: 'Toronto',
        state: 'on',
        postalCode: 'M5V 2T6',
      }
      const result = await service.validateAddress(dto)
      expect(result.success).toBe(true)
      expect(result.formattedAddress.postalCode).toBe('M5V 2T6')
      expect(result.formattedAddress.state).toBe('ON')
    })

    it('should throw BadRequestException for invalid CA postal codes', async () => {
      const dto = {
        recipientName: 'Bob Smith',
        phone: '+15559876543',
        address: '456 Queen St',
        country: 'CA',
        city: 'Toronto',
        state: 'ON',
        postalCode: '123456',
      }
      await expect(service.validateAddress(dto)).rejects.toThrow(BadRequestException)
    })
  })

  describe('UK Postal Code Validation', () => {
    it('should pass for valid UK postal code', async () => {
      const dto = {
        recipientName: 'Alice Green',
        phone: '+447911123456',
        address: '10 Downing St',
        country: 'GB',
        city: 'London',
        state: 'eng',
        postalCode: 'SW1A 1AA',
      }
      const result = await service.validateAddress(dto)
      expect(result.success).toBe(true)
      expect(result.formattedAddress.postalCode).toBe('SW1A 1AA')
    })

    it('should throw for invalid UK postal codes', async () => {
      const dto = {
        recipientName: 'Alice Green',
        phone: '+447911123456',
        address: '10 Downing St',
        country: 'GB',
        city: 'London',
        state: 'ENG',
        postalCode: '90210',
      }
      await expect(service.validateAddress(dto)).rejects.toThrow(BadRequestException)
    })
  })

  describe('Fallback Country Validation', () => {
    it('should pass for general alphanumeric postal codes', async () => {
      const dto = {
        recipientName: 'Hiro Tanaka',
        phone: '+819012345678',
        address: '1-1 Chiyoda',
        country: 'JP',
        city: 'Tokyo',
        state: 'Tokyo',
        postalCode: '100-0001',
      }
      const result = await service.validateAddress(dto)
      expect(result.success).toBe(true)
    })

    it('should throw for postal codes that are too long', async () => {
      const dto = {
        recipientName: 'Hiro Tanaka',
        phone: '+819012345678',
        address: '1-1 Chiyoda',
        country: 'JP',
        city: 'Tokyo',
        state: 'Tokyo',
        postalCode: '123456789012',
      }
      await expect(service.validateAddress(dto)).rejects.toThrow(BadRequestException)
    })
  })
})
