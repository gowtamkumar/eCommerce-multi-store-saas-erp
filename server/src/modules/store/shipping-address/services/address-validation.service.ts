import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { CreateShippingAddressDto } from '../dto/create-shipping-address.dto'
import { UpdateShippingAddressDto } from '../dto/update-shipping-address.dto'

@Injectable()
export class AddressValidationService {
  private readonly logger = new Logger(AddressValidationService.name)

  async validateAddress(
    dto: CreateShippingAddressDto | UpdateShippingAddressDto,
  ): Promise<{ success: boolean; formattedAddress?: any }> {
    const country = (dto.country || 'BD').toUpperCase()

    // 1. If country is BD, it is a local address. We skip strict international address requirements.
    if (country === 'BD') {
      return { success: true }
    }

    // 2. For international (non-BD) addresses, enforce state, city, and postalCode
    if (!dto.city) {
      throw new BadRequestException('City is required for international shipping addresses.')
    }
    if (!dto.state) {
      throw new BadRequestException(
        'State/Region is required for international shipping addresses.',
      )
    }
    if (!dto.postalCode) {
      throw new BadRequestException('Postal code is required for international shipping addresses.')
    }

    // 3. Regex validation for postal codes depending on country
    const postalCode = dto.postalCode.trim()
    let isValidPostalCode = false

    if (country === 'US') {
      // US Zip Code format: 12345 or 12345-6789
      const usRegex = /^\d{5}(-\d{4})?$/
      isValidPostalCode = usRegex.test(postalCode)
    } else if (country === 'CA') {
      // Canada Postal Code format: A1A 1A1 (with optional space/hyphen)
      const caRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
      isValidPostalCode = caRegex.test(postalCode)
    } else if (country === 'GB' || country === 'UK') {
      // UK Postal Code format: e.g., SW1A 1AA
      const ukRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$/i
      isValidPostalCode = ukRegex.test(postalCode)
    } else {
      // General fallback validation for other countries: alphanumeric string between 3 and 10 characters
      const generalRegex = /^[a-zA-Z0-9\s\-]{3,10}$/
      isValidPostalCode = generalRegex.test(postalCode)
    }

    if (!isValidPostalCode) {
      throw new BadRequestException(
        `Invalid postal code format "${postalCode}" for country ${country}.`,
      )
    }

    // 4. Simulate/Mock external address validation API (e.g. Smarty/Google Places API)
    this.logger.log(
      `Performing mock address validation for country: ${country}, zip: ${postalCode}`,
    )

    // Normalize and format address components
    const formatted = {
      recipientName: dto.recipientName ? dto.recipientName.trim() : undefined,
      phone: dto.phone ? dto.phone.trim() : undefined,
      address: dto.address ? dto.address.trim() : undefined,
      city: dto.city.trim().toUpperCase(), // uppercase for clean standard logistics sorting
      state: dto.state.trim().toUpperCase(),
      postalCode: postalCode.toUpperCase(),
      country: country,
    }

    return {
      success: true,
      formattedAddress: formatted,
    }
  }
}
