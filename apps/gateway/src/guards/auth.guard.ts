import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import {Observable} from "rxjs";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);
        if (isPublic) {
          return true;
        }
        
        const req = context.switchToHttp().getRequest();

        if (!req?.headers?.authorization) {
            throw new UnauthorizedException({message: 'Пользователь не авторизован'});
        }

        const authHeader = req.headers.authorization.split(' ');
        const bearer = authHeader[0];
        const token = authHeader[1];

        if (bearer !== 'Bearer' || !token) {
            throw new UnauthorizedException({message: 'Пользователь не авторизован'});
        }

        this.jwtService.verify(token);

        return true
    }
}
