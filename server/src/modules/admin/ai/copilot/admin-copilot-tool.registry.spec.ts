import { isAdminCopilotToolName } from './admin-copilot-tool.registry'

describe('admin-copilot-tool.registry', () => {
  it('recognizes valid tool names', () => {
    expect(isAdminCopilotToolName('listOrders')).toBe(true)
    expect(isAdminCopilotToolName('getStockLevel')).toBe(true)
  })

  it('rejects unknown tool names', () => {
    expect(isAdminCopilotToolName('deleteOrder')).toBe(false)
  })
})
