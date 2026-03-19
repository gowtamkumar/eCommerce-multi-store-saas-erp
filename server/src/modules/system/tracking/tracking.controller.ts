import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { TrafficService } from '../super-admin/traffic.service';

@Controller('tracking')
export class TrackingController {
    constructor(private readonly trafficService: TrafficService) { }

    // endpoint removed as per user request to drop page traffic tracking
}
