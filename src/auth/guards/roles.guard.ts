import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { UserRole } from "src/users/entities/user.entity";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!required || required.length === 0) return true; // rotue does not requires role
    
        const user = context.switchToHttp().getRequest().user;
        
        if (!user) throw new ForbiddenException('Unauthenticated');
        if (!required.includes(user.role)) throw new ForbiddenException('Insufficient role');

        return true;
    }
}