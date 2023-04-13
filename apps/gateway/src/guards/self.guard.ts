import { Roles } from "@app/common/roles.enum";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {Observable} from "rxjs";

@Injectable()
export class SelfGuard implements CanActivate {
    constructor(private jwtService: JwtService,) {
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization.split(' ');
        const token = authHeader[1];
        const user = this.jwtService.verify(token);
        
        if(user.role == Roles.ADMIN){
            return true;
        }

        return user.id == req.body?.id || user.id == req.params?.id;
    }
}
