import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CreateSubscriberDto } from './dto/subscriber.dto';
import { SubscriberService } from './subscriber.service';

@Controller('subscribers')
export class SubscriberController {
    constructor(private readonly subscriberService: SubscriberService) { }

    @Post()
    createSubscriber(@Body() createSubscriberDto: CreateSubscriberDto) {
        return this.subscriberService.createSubscriber(createSubscriberDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    findAllSubscribers() {
        return this.subscriberService.findAllSubscribers();
    }
}
