import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RolesGuard } from '@/common/guards/roles.guard'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceService } from './invoice.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Post()
    @Roles(UserRole.Admin, UserRole.StoreManager)
    createInvoice(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req: any) {
        return this.invoiceService.createInvoice(createInvoiceDto, req.user.tenantId);
    }

    @Get()
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Support, UserRole.Operator)
    findAllInvoices(@Request() req: any) {
        return this.invoiceService.findAllInvoices(req.user.tenantId);
    }

    @Get(':id')
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Support, UserRole.Operator)
    findOneInvoice(@Param('id') id: string, @Request() req: any) {
        return this.invoiceService.findOneInvoice(id, req.user.tenantId);
    }

    @Patch(':id')
    @Roles(UserRole.Admin, UserRole.StoreManager)
    updateInvoice(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @Request() req: any) {
        return this.invoiceService.updateInvoice(id, updateInvoiceDto, req.user.tenantId);
    }

    @Delete(':id')
    @Roles(UserRole.Admin, UserRole.StoreManager)
    removeInvoice(@Param('id') id: string, @Request() req: any) {
        return this.invoiceService.removeInvoice(id, req.user.tenantId);
    }
}
