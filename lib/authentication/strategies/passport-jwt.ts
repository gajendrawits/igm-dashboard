import passportJWT from 'passport-jwt';
import UnauthenticatedError from '../../../lib/error/unauthenticated.error';
import { MESSAGES } from '../../../utils/messages';
import { HEADERS } from '../../../utils/constants';
import { Request } from 'express';
import dotenv from "dotenv";

dotenv.config()

const JwtStrategy = passportJWT.Strategy;
console.log(process.env.JWT_TOKEN_PUBLIC_KEY,"=process.env.JWT_TOKEN_PUBLIC_KEY=")
if (!process.env.JWT_TOKEN_PUBLIC_KEY) {
    throw new Error('JWT public key is not defined');
}
const secret: any = process.env.JWT_TOKEN_PUBLIC_KEY.replace(/\\n/g,'\n');
console.log(secret,"==secret");

const tokenExtractor = (req: Request): any => {
    const token = req.get(HEADERS.ACCESS_TOKEN) || null;
    console.log(token,"===token====")
    if (!token) {
        throw new UnauthenticatedError(
            MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID
        );
    }

    const tokenArray = token.split(' ');
    const tokenExtracted =  tokenArray.length > 1 ? tokenArray[1].trim() : null;
    return tokenExtracted;
    
};

const passportJwtStrategy = new JwtStrategy(
    {
        jwtFromRequest: tokenExtractor,
        secretOrKey: secret,
        passReqToCallback: true,
    },
    async (req:any,jwtPayload: any, done: any) => {
        try {
            let user: any = {};
            console.log(jwtPayload,"==jwtPayload")
            if (jwtPayload.user) {
                user = jwtPayload.user;
                // user.isGuest = jwtPayload.isGuest;
            } else if (jwtPayload.userId) {
                const userIdFromReq = req.userId;
                console.log(userIdFromReq,"userIdFromReq")
                if (!user) {
                    return done(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID), null);
                }
                if (user.enabled === false) {
                    return done(new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCOUNT_DEACTIVATED), null);
                }
                user = user.toJSON();
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
);

export default passportJwtStrategy;

