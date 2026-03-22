import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user/user-role.enum';
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
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing, UserRole.Support, UserRole.Operator)
    @Get()
    findAllSubscribers() {
        return this.subscriberService.findAllSubscribers();
    }
}
