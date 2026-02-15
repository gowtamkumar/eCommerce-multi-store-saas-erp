import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateSubscriberDto } from './dto/subscriber.dto';
import { SubscriberService } from './subscriber.service';

@Controller('subscribers')
export class SubscriberController {
    constructor(private readonly subscriberService: SubscriberService) { }

    @Post()
    create(@Body() createSubscriberDto: CreateSubscriberDto) {
        return this.subscriberService.create(createSubscriberDto);
    }
    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    findAll() {
        return this.subscriberService.findAll();
    }
}
