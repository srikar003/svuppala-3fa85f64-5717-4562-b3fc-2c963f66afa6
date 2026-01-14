import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUser } from '@svuppala-3fa85f64-5717-4562-b3fc-2c963f66afa6/data';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: any): JwtUser {
    return {
      userId: payload.sub,
      role: payload.role,
      orgId: payload.orgId,
    };
  }
}
