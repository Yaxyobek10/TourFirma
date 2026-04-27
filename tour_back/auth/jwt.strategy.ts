import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { UserRole } from '../common/enum/user-role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    const realmRoles: string[] = payload.realm_access?.roles ?? [];

    const roleMap: Record<string, UserRole> = {
      admin:     UserRole.ADMIN,
      tourist:   UserRole.TOURIST,
      guide:     UserRole.GUIDE,
      tourfirma: UserRole.TOURFIRMA,
      rent_car:  UserRole.RENT_CAR,
    };

    const matched = realmRoles.find(r => roleMap[r]);
    const role = matched ? roleMap[matched] : UserRole.TOURIST;

    return {
      id:       payload.sub,
      email:    payload.email,
      username: payload.preferred_username,
      role,
    };
  }
}
