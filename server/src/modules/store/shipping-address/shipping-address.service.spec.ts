import { Test, TestingModule } from '@nestjs/testing'
import { ShippingAddressRepository } from './shipping-address.repository'
import { ShippingAddressService } from './shipping-address.service'
import { AddressValidationService } from './services/address-validation.service'

describe('ShippingAddressService', () => {
  let service: ShippingAddressService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingAddressService,
        {
          provide: ShippingAddressRepository,
          useValue: {},
        },
        {
          provide: AddressValidationService,
          useValue: {
            validateAddress: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<ShippingAddressService>(ShippingAddressService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
