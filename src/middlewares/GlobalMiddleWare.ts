import { header, validationResult } from "express-validator";
import { Jwt } from '../utils/Jwt'

export class GlobalMiddleWare {

    static checkError(req, res, next) {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            next(new Error(errors.array()[0].msg))
        } else {
            next()
        }
    }

    static async auth(req, res, next) {
        const header_auth = req.headers.authorization
        const token = header_auth ? header_auth.slice(7, header_auth.length) : null
        // const authHeader = header_auth.split(' '); const token1 = authHeader[1]
        try {
            if(!token) {
                req.errorStatus = 403
                next(new Error('Access is forbidden! User doesn\'t exists'))
            }
            
            const decoded = await Jwt.jwtVerify(token)
            req.user = decoded
            next()
        } catch(e) {
            req.errorStatus = 403
            // next(e)
            next(new Error('Your session is expired or Invalid User! Please Login Again...'))
        }
    }

    static async decodeRefreshToken(req, res, next) {
        const refreshToken = req.body.refreshToken
        try {
            if(!refreshToken) {
                req.errorStatus = 403
                next(new Error('Access is forbidden! User doesnt exist'))
            }
            const decoded = await Jwt.jwtVerifyRefreshToken(refreshToken)
            req.user = decoded
            next()
        } catch(e) {
            req.errorStatus = 403
            // next(e)
            next(new Error('Your session is expired! Please Login Again'))
        }
    }

    static adminRole(req, res, next) {
        const user = req.user
        if(user.type !== 'admin') {
            req.errorStatus = 401
            next(new Error('You are an unauthorized user'))
        }
        next()
    }

    static adminOrStoreRole(req, res, next) {
        const user = req.user
        if(user.type == 'admin' || user.type == 'store') {
        next()
        } else {
            //req.errorStatus = 401
            next(new Error('You are an unauthorized user'))
        }
    }
}