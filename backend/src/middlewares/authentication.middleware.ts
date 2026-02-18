import passport from 'passport';
import type { RequestHandler } from 'express';
import type { User } from '../entity/user.entity.js';

export const authenticateJWT: RequestHandler = (req, res, next) => {
    passport.authenticate(
        'jwt', 
        { session: false }, 
        (err: unknown, user: User | false) => {
        if (err) return next(err);

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no autenticado o token inválido'
            });
        }

        req.user = user;
        return next();
    })(req, res, next);
};