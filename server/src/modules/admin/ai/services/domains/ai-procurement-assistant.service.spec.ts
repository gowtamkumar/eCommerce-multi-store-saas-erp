import { Test, TestingModule } from '@nestjs/testing'
import { AiAssistantBaseService } from '../ai-assistant-base.service'
import { SupplierInvoiceService } from '@/modules/admin/operations/finance/purchase/services/supplier-invoice.service'
import { AiProcurementAssistantService } from './ai-procurement-assistant.service'

describe('AiProcurementAssistantService', () => {
  let service: AiProcurementAssistantService
  let baseService: any
  let supplierInvoiceService: any

  beforeEach(async () => {
    baseService = {
      complete: jest.fn().mockResolvedValue({
        content: JSON.stringify({
          explanationText: 'Discrepancy found: Invoice price is higher than PO price.',
          discrepancies: ['Product ID prod-1 price is $10 but PO price is $8'],
          matchStatus: 'DISCREPANCY',
        }),
      }),
      parseJsonResponse: jest.fn().mockImplementation((content, fallback) => {
        return JSON.parse(content)
      }),
    }

    supplierInvoiceService = {
      findOneInvoice: jest.fn().mockResolvedValue({
        id: 'invoice-1',
        invoiceNumber: 'INV-100',
        invoiceDate: new Date(),
        matchStatus: 'DISCREPANCY',
        discrepancyNotes: 'Price mismatch',
        totalAmount: 100,
        purchaseOrderId: 'po-1',
        purchaseOrder: {
          referenceNumber: 'PO-200',
          totalAmount: 80,
          items: [{ productId: 'prod-1', quantity: 10, unitPrice: 8 }],
        },
        items: [{ productId: 'prod-1', quantity: 10, unitPrice: 10 }],
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiProcurementAssistantService,
        {
          provide: AiAssistantBaseService,
          useValue: baseService,
        },
        {
          provide: SupplierInvoiceService,
          useValue: supplierInvoiceService,
        },
      ],
    }).compile()

    service = module.get<AiProcurementAssistantService>(AiProcurementAssistantService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should generate three-way match explanation', async () => {
    const result = await service.generateThreeWayMatchExplainer('tenant-1', {
      invoiceId: 'invoice-1',
    })

    expect(supplierInvoiceService.findOneInvoice).toHaveBeenCalledWith('invoice-1', { tenantId: 'tenant-1' })
    expect(baseService.complete).toHaveBeenCalled()
    expect(result.matchStatus).toBe('DISCREPANCY')
    expect(result.explanationText).toContain('Discrepancy found')
  })
})
