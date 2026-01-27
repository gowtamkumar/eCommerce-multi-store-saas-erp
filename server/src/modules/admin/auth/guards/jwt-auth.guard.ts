import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { AuthStrategy } from '../../../../common/enums/auth/auth-strategy.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard(AuthStrategy.JwtAuth) {
  anActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (info instanceof JsonWebTokenError) {
      console.error("[JwtAuthGuard] JsonWebTokenError:", info.message);
      throw new UnauthorizedException(info.message || 'Invalid Token!');
    }
    if (err || info || !user) {
      console.error("[JwtAuthGuard] Auth failed:", err || info);
      throw err || new UnauthorizedException(`${info}`);
    }
    return user;
  }
}
