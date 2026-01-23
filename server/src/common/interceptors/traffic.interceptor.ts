import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TrafficService } from '../../modules/super-admin/traffic.service';

@Injectable()
export class TrafficInterceptor implements NestInterceptor {
    constructor(private readonly trafficService: TrafficService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const tenantId = request.tenantId || request.headers['x-tenant-id'];

        if (tenantId) {
            const path = request.url.split('?')[0];
            // Log traffic asynchronously to not block the request
            this.trafficService.logRequest(tenantId).catch(err =>
                console.error('Traffic log failed:', err)
            );
            this.trafficService.logPageHit(tenantId, path).catch(err =>
                console.error('Page traffic log failed:', err)
            );
        }

        return next.handle();
    }
}
