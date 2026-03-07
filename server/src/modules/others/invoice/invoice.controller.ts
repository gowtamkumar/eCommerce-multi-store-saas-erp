import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceService } from './invoice.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Post()
    createInvoice(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req: any) {
        return this.invoiceService.createInvoice(createInvoiceDto, req.user.tenantId);
    }

    @Get()
    findAllInvoices(@Request() req: any) {
        return this.invoiceService.findAllInvoices(req.user.tenantId);
    }

    @Get(':id')
    findOneInvoice(@Param('id') id: string, @Request() req: any) {
        return this.invoiceService.findOneInvoice(id, req.user.tenantId);
    }

    @Patch(':id')
    updateInvoice(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @Request() req: any) {
        return this.invoiceService.updateInvoice(id, updateInvoiceDto, req.user.tenantId);
    }

    @Delete(':id')
    removeInvoice(@Param('id') id: string, @Request() req: any) {
        return this.invoiceService.removeInvoice(id, req.user.tenantId);
    }
}
