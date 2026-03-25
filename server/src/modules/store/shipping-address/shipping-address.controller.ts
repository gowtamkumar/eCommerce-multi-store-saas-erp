import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ShippingAddressService } from './shipping-address.service';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';

@UseGuards(JwtAuthGuard)
@Controller('store/shipping-address')
export class ShippingAddressController {
    private readonly logger = new Logger(ShippingAddressController.name);

    constructor(private readonly service: ShippingAddressService) { }

    @Get()
    findShippingAddresses(@Req() req: any) {
        this.logger.log(`${this.findShippingAddresses.name} Controller Called`);
        return this.service.findShippingAddresses(req.user.id, req.tenantId);
    }

    @Get(':id')
    findShippingAddress(@Param('id') id: string, @Req() req: any) {
        return this.service.findShippingAddress(id, req.user.id, req.tenantId);
    }

    @Post()
    createShippingAddress(@Req() req: any, @Body() dto: CreateShippingAddressDto) {
        this.logger.log(`${this.createShippingAddress.name} Controller Called`);
        return this.service.createShippingAddress(req.user.id, req.tenantId, dto);
    }

    @Put(':id')
    updateShippingAddress(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateShippingAddressDto) {
        return this.service.updateShippingAddress(id, req.user.id, req.tenantId, dto);
    }

    @Patch(':id/default')
    setDefaultShippingAddress(@Param('id') id: string, @Req() req: any) {
        return this.service.setDefaultShippingAddress(id, req.user.id, req.tenantId);
    }

    @Delete(':id')
    removeShippingAddress(@Param('id') id: string, @Req() req: any) {
        return this.service.removeShippingAddress(id, req.user.id, req.tenantId);
    }
}
