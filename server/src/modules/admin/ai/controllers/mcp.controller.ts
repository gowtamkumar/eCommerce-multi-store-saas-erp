import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Request, Response } from 'express'
import { McpService } from '../services/mcp.service'
import { Public } from '@/common/decorators/public.decorator'
import { McpAuthGuard } from '../guards/mcp-auth.guard'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { assertStoreContext } from '@/common/utils/assert-store-context.util'

@Controller('ai/mcp')
@UseGuards(McpAuthGuard)
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  /**
   * SSE endpoint for MCP clients to connect.
   * Format: GET /api/v1/ai/mcp/sse?token=<jwt-token>
   */
  @Public()
  @Get('sse')
  async establishSSE(
    @Req() req: Request,
    @Res() res: Response,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<void> {
    assertStoreContext(ctx.storeId)
    await this.mcpService.handleSseConnection(req, res, ctx)
  }

  /**
   * Relay endpoint for incoming client request messages.
   * Format: POST /api/v1/ai/mcp/messages?sessionId=<session-id>&token=<jwt-token>
   */
  @Public()
  @Post('messages')
  async handleMessages(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.mcpService.handleIncomingMessage(req, res)
  }
}
