import * as jwt from 'jsonwebtoken'
import { getEnvironmentVariables } from '../environments/environment'
import { Redis } from './Redis'



export class Jwt {

    static jwtSign(payload, UserId: string, expiresIn: string = '1h') {
        return jwt.sign(
            payload,
            getEnvironmentVariables().jwt_secret_key,
            { 
                expiresIn: expiresIn, 
                audience: UserId,
                issuer: 'lush.com',
            }
        )
    }

    static jwtVerify(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, getEnvironmentVariables().jwt_secret_key, (err, decoded) => {
                if(err) reject(err)
                else if(!decoded) reject(new Error('User is not authorised.'))
                else resolve(decoded)
            })
        })
    }

    static async jwtSignRefreshToken(payload, UserId: string, expiresIn: string = '1y',
    // redis_ex: number = 365 * 24 * 60 * 60
    redis_ex: number = 20
    ) {
        try {
            const refreshToken = jwt.sign(
                payload,
                getEnvironmentVariables().jwt_refresh_secret_key,
                { 
                    expiresIn: expiresIn, 
                    audience: UserId,
                    issuer: 'lush.com',
                }
            )
            //set refreshToken in Redis with key userId
            await Redis.setValue(UserId.toString(), refreshToken, redis_ex)
            return refreshToken

        } catch(e) {
            throw(e)
        }
    }

    static jwtVerifyRefreshToken(refreshToken: string): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(refreshToken, getEnvironmentVariables().jwt_refresh_secret_key, (err, decoded) => {
                if(err) reject(err)
                else if(!decoded) reject(new Error('User is not authorised.'))
                else {
                    //get token to match the one in Redis database
                    const user:any = decoded
                    Redis.getValue(user.aud).then(value => {
                        if(value === refreshToken) resolve(decoded)
                        else reject(new Error('User is not authorised.'))
                    })
                    .catch(e => {
                        reject(e)
                    })
            }
            })
        })
    }
}