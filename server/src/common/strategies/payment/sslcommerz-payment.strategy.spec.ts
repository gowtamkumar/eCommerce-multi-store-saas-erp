import { SslCommerzPaymentStrategy } from './sslcommerz-payment.strategy'

describe('SslCommerzPaymentStrategy', () => {
  describe('validateCallback (shape-only)', () => {
    let strategy: SslCommerzPaymentStrategy
    beforeEach(() => {
      strategy = new SslCommerzPaymentStrategy()
    })

    it('marks VALID as success', async () => {
      const result = await strategy.validateCallback({ status: 'VALID', tran_id: 'T1' })
      expect(result.success).toBe(true)
      expect(result.transactionId).toBe('T1')
    })

    it('marks VALIDATED as success (case-insensitive)', async () => {
      const result = await strategy.validateCallback({ status: 'validated', tran_id: 'T2' })
      expect(result.success).toBe(true)
    })

    it('no longer trusts a bare tran_id with no status', async () => {
      const result = await strategy.validateCallback({}, { tran_id: 'T3' })
      expect(result.success).toBe(false)
      expect(result.transactionId).toBe('T3')
    })

    it('rejects FAILED/CANCELLED', async () => {
      const failed = await strategy.validateCallback({ status: 'FAILED', tran_id: 'T4' })
      expect(failed.success).toBe(false)
      const cancelled = await strategy.validateCallback({ status: 'CANCELLED', tran_id: 'T5' })
      expect(cancelled.success).toBe(false)
    })
  })

  describe('verifyTransaction', () => {
    let strategy: SslCommerzPaymentStrategy

    beforeEach(() => {
      strategy = new SslCommerzPaymentStrategy()
      jest.spyOn((strategy as any).logger, 'error').mockImplementation(() => {})
      jest.spyOn((strategy as any).logger, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    function mockValidator(payload: any, ok = true) {
      const json = jest.fn().mockResolvedValue(payload)
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({ ok, json } as any)
      return fetchSpy
    }

    it('refuses when val_id is missing', async () => {
      const result = await strategy.verifyTransaction({
        valId: undefined,
        transactionId: 'T1',
        storeId: 's',
        storePassword: 'p',
        isSandbox: true,
        expectedAmount: 100,
        expectedCurrency: 'BDT',
      })
      expect(result.success).toBe(false)
      expect(result.reason).toMatch(/val_id/i)
    })

    it('refuses when credentials are missing', async () => {
      const result = await strategy.verifyTransaction({
        valId: 'v',
        transactionId: 'T1',
        expectedAmount: 100,
        expectedCurrency: 'BDT',
      })
      expect(result.success).toBe(false)
      expect(result.reason).toMatch(/configured/i)
    })

    it('succeeds when gateway returns VALID with matching amount/currency/tran_id', async () => {
      mockValidator({
        status: 'VALID',
        tran_id: 'T1',
        amount: '100.00',
        currency: 'BDT',
      })
      const result = await strategy.verifyTransaction({
        valId: 'v',
        transactionId: 'T1',
        storeId: 's',
        storePassword: 'p',
        isSandbox: true,
        expectedAmount: 100,
        expectedCurrency: 'BDT',
      })
      expect(result.success).toBe(true)
    })

    it('rejects tran_id mismatch', async () => {
      mockValidator({ status: 'VALID', tran_id: 'OTHER', amount: '100', currency: 'BDT' })
      const result = await strategy.verifyTransaction({
        valId: 'v',
        transactionId: 'T1',
        storeId: 's',
        storePassword: 'p',
        isSandbox: true,
        expectedAmount: 100,
        expectedCurrency: 'BDT',
      })
      expect(result.success).toBe(false)
      expect(result.reason).toMatch(/tran_id/i)
    })

    it('rejects currency mismatch', async () => {
      mockValidator({ status: 'VALID', tran_id: 'T1', amount: '100', currency: 'EUR' })
      const result = await strategy.verifyTransaction({
        valId: 'v',
        transactionId: 'T1',
        storeId: 's',
        storePassword: 'p',
        isSandbox: true,
        expectedAmount: 100,
        expectedCurrency: 'BDT',
      })
      expect(result.success).toBe(false)
      expect(result.reason).toMatch(/currency/i)
    })

    it('rejects amount mismatch beyond tolerance', async () => {
      mockValidator({ status: 'VALID', tran_id: 'T1', amount: '99.50', currency: 'BDT' })
      const result = await strategy.verifyTransaction({
        valId: 'v',
        transactionId: 'T1',
        storeId: 's',
        storePassword: 'p',
        isSandbox: true,
        expectedAmount: 100,
        expectedCurrency: 'BDT',
      })
      expect(result.success).toBe(false)
      expect(result.reason).toMatch(/amount/i)
    })

    it('accepts amounts within the 1-cent tolerance', async () => {
      mockValidator({ status: 'VALID', tran_id: 'T1', amount: '100.01', currency: 'BDT' })
      const result = await strategy.verifyTransaction({
        valId: 'v',
        transactionId: 'T1',
        storeId: 's',
        storePassword: 'p',
        isSandbox: true,
        expectedAmount: 100,
        expectedCurrency: 'BDT',
      })
      expect(result.success).toBe(true)
    })

    it('hits the sandbox URL when isSandbox=true', async () => {
      const spy = mockValidator({
        status: 'VALID',
        tran_id: 'T1',
        amount: '100',
        currency: 'BDT',
      })
      await strategy.verifyTransaction({
        valId: 'v',
        transactionId: 'T1',
        storeId: 's',
        storePassword: 'p',
        isSandbox: true,
        expectedAmount: 100,
        expectedCurrency: 'BDT',
      })
      expect(String(spy.mock.calls[0][0])).toContain('sandbox.sslcommerz.com')
    })

    it('hits the production URL when isSandbox=false', async () => {
      const spy = mockValidator({
        status: 'VALID',
        tran_id: 'T1',
        amount: '100',
        currency: 'BDT',
      })
      await strategy.verifyTransaction({
        valId: 'v',
        transactionId: 'T1',
        storeId: 's',
        storePassword: 'p',
        isSandbox: false,
        expectedAmount: 100,
        expectedCurrency: 'BDT',
      })
      expect(String(spy.mock.calls[0][0])).toContain('securepay.sslcommerz.com')
    })

    it('returns failure when the validator HTTP call throws', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network'))
      const result = await strategy.verifyTransaction({
        valId: 'v',
        transactionId: 'T1',
        storeId: 's',
        storePassword: 'p',
        isSandbox: true,
        expectedAmount: 100,
        expectedCurrency: 'BDT',
      })
      expect(result.success).toBe(false)
      expect(result.reason).toMatch(/validator/i)
    })

    it('rejects when gateway status is FAILED', async () => {
      mockValidator({ status: 'FAILED', tran_id: 'T1', amount: '100', currency: 'BDT' })
      const result = await strategy.verifyTransaction({
        valId: 'v',
        transactionId: 'T1',
        storeId: 's',
        storePassword: 'p',
        isSandbox: true,
        expectedAmount: 100,
        expectedCurrency: 'BDT',
      })
      expect(result.success).toBe(false)
    })
  })
})
