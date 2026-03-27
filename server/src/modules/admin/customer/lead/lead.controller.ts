import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Logger } from '@nestjs/common';
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RolesGuard } from '@/common/guards/roles.guard'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { FilterLeadDto } from './dto/filter-lead.dto';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { LeadService } from './lead.service';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leads')
export class LeadController {
    private readonly logger = new Logger(LeadController.name);

    constructor(private readonly leadService: LeadService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR, UserRole.USER)
    async createLead(@RequestContext() ctx: RequestContextDto, @Body() dto: CreateLeadDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createLead.`);
        return await this.leadService.createLead(dto, ctx.tenantId);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING, UserRole.SUPPORT, UserRole.OPERATOR)
    async findAllLeads(@RequestContext() ctx: RequestContextDto, @Query() filterDto: FilterLeadDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllLeads.`);
        const { leads, total } = await this.leadService.findAllLeads(filterDto, ctx.tenantId);
        return {
            success: true,
            statusCode: 200,
            data: {
                leads,
                pagination: {
                    total,
                    page: filterDto.page,
                    limit: filterDto.limit,
                    totalPages: Math.ceil(total / filterDto.limit),
                },
            },
        };
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT)
    async updateLead(@RequestContext() ctx: RequestContextDto, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateLead.`);
        return await this.leadService.updateLead(id, dto, ctx.tenantId);
    }
}
