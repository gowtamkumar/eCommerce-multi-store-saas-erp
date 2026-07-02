import { Injectable, Logger } from '@nestjs/common'
import { AdminCopilotToolService } from './admin-copilot-tool.service'
import { ADMIN_COPILOT_TOOLS } from '../copilot/admin-copilot-tool.registry'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Response, Request } from 'express'

interface McpSession {
  server: Server
  transport: SSEServerTransport
  context: RequestContextDto
}

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name)
  private readonly sessions = new Map<string, McpSession>()

  constructor(
    private readonly adminCopilotToolService: AdminCopilotToolService,
  ) {}

  /**
   * Establishes a Server-Sent Events stream for an authenticated MCP client.
   */
  async handleSseConnection(
    req: Request,
    res: Response,
    ctx: RequestContextDto,
  ): Promise<void> {
    const token = (req.query.token as string) || ''
    const transport = new SSEServerTransport(`/ai/mcp/messages?token=${encodeURIComponent(token)}`, res)
    const sessionId = transport.sessionId

    this.logger.log(`Establishing MCP SSE session ${sessionId} for user ${ctx.userId} (store: ${ctx.storeId})`)

    // Create a dedicated server instance for this connection
    const server = new Server(
      {
        name: 'ecommerce-saas-erp-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    // Register handlers bound to this user's context
    this.registerToolHandlers(server, ctx)

    // Store session
    this.sessions.set(sessionId, { server, transport, context: ctx })

    // Clean up on disconnect
    req.on('close', () => {
      this.logger.log(`MCP SSE session ${sessionId} connection closed`)
      this.sessions.delete(sessionId)
      transport.close().catch((err) => {
        this.logger.error(`Error closing transport for session ${sessionId}`, err)
      })
    })

    // Start transport connection
    await server.connect(transport)
  }

  /**
   * Routes incoming messages (POST payloads) to the correct SSE transport session.
   */
  async handleIncomingMessage(
    req: Request,
    res: Response,
  ): Promise<void> {
    const sessionId = req.query.sessionId as string
    if (!sessionId) {
      res.status(400).send('Missing sessionId')
      return
    }

    const session = this.sessions.get(sessionId)
    if (!session) {
      res.status(404).send('Session not found or expired')
      return
    }

    try {
      await session.transport.handlePostMessage(req, res, req.body)
    } catch (error) {
      this.logger.error(`Error handling message for session ${sessionId}`, error)
      if (!res.headersSent) {
        res.status(500).send('Internal server error')
      }
    }
  }

  /**
   * Registers MCP tools and links them to the underlying AdminCopilotToolService.
   */
  private registerToolHandlers(server: Server, ctx: RequestContextDto): void {
    // Utility functions to convert between camelCase and snake_case
    const camelToSnake = (str: string) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    const snakeToCamel = (str: string) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())

    // 1. Register list tools handler dynamically from the tool registry (DRY)
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = ADMIN_COPILOT_TOOLS.map((tool) => {
        const properties: Record<string, any> = {}
        const required: string[] = []

        for (const [argName, argDesc] of Object.entries(tool.args)) {
          const isOptional = argDesc.toLowerCase().includes('optional')
          properties[argName] = {
            type: 'string', // General representation for inputs
            description: argDesc,
          }
          if (!isOptional) {
            required.push(argName)
          }
        }

        return {
          name: camelToSnake(tool.name),
          description: tool.description,
          inputSchema: {
            type: 'object',
            properties,
            required: required.length > 0 ? required : undefined,
          },
        }
      })

      return { tools }
    })

    // 2. Register tool call execution handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params
      const targetTool = snakeToCamel(name)
      this.logger.log(`Session tool call triggered: ${name} mapped to ${targetTool} (store: ${ctx.storeId})`)

      try {
        const result = await this.adminCopilotToolService.execute(
          targetTool,
          (args || {}) as Record<string, unknown>,
          ctx,
        )

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      } catch (error) {
        this.logger.error(`MCP Tool execution failed for tool ${name}`, error)
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: error instanceof Error ? error.message : 'Unknown tool execution error',
            },
          ],
        }
      }
    })
  }
}
