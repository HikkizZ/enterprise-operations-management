import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import type { StrategyOptions } from 'passport-jwt';
import { AppDataSource } from '../config/configDB.js';
import { User } from '../entity/user.entity.js';
import { configEnv } from '../config/configEnv.js';
import type { AuthTokenPayload } from '../types/user.types.js';

type JwtPayload = AuthTokenPayload & {
    iat?: number;
    exp?: number;
};

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: configEnv.auth.accessTokenSecret,
};

export const registerPassportJWTStrategy = () => {
    passport.use(
        new JwtStrategy(options, async (jwtPayload: JwtPayload, done) => {
            try {
                const userRepository = AppDataSource.getRepository(User);
                const user = await userRepository.findOne({
                    where: { corporateEmail: jwtPayload.corporateEmail }
                });

                if (!user) return done(null, false);

                if (user.accountStatus !== 'Activa') return done(null, false);

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        })
    );
}
