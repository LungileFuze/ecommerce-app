import { body, query } from "express-validator"
import User from "../models/User"

export class UserValidators {
    static otpLogin() {
        return [
            query('phone', 'Phone number is requierd').isString(),
            query('otp', 'Otp is required').isNumeric()
        ]
    }
    
    static registerUserViaPhone() {
        return [
            query('phone', 'Phone number is requierd').isString()
            .custom((phone, {req}) => {
                return User.findOne({
                    phone: phone,
                    type: 'user'
                }).then(user => {
                    if(user) {
                        req.user = user
                        req.register = true
                    } else {
                        return true
                    }
                }).catch(e => {
                    throw new Error(e)
                })
            })
        ]
    }
    
    static signup() {
        return [
            body('name', 'Name is required').isString(),
            body('phone', 'Phone number is required').isString(),
            body('email', 'Email is required').isEmail().custom((email, {req}) => {
                return User.findOne({
                    email: email,
                    //type: 'user
                }).then(user => {
                    if(user) {
                        // throw new Error('User Already Exists')
                        throw('User Already Exists')

                    } else {
                        return true
                    }
                }).catch(e => {
                    throw new Error(e)
                })
            }),
            body('password', 'Passoword is required').isAlphanumeric()
                .isLength({min: 5, max: 25})
                .withMessage('Password must between 8-25 characters'),
            body('type', 'User role type is required').isString(),
            body('status', 'User status is required').isString(),
            // .custom((value, {req}) => {
            //     if(req.body.email) return true
            //     else {
            //         throw new Error('Email is not available for validation')
            //     }
            // })

        ]
    }

    static verifyUserEmailToken() {
        return [
            body('verification_token', 'Email verification is required').isNumeric(),
        ]
    }

    static login() {
        return [
            query('email', 'Email is required').isEmail()
            .custom((email, {req}) => {
                return User.findOne({
                    email: email
                }).then(user => {
                    if (user) {
                        if(user.type == 'user' || user.type == 'admin' || user.type == 'store'){
                            req.user = user;
                            return true
                        } else{
                            throw('You are not authorised')
                        }
                       
                    } else {
                        throw('No user registered with such email')
                    }
                }).catch(e => {
                    throw new Error(e)
                })
            }),
            query('password', 'Password is required').isAlphanumeric()
        ]
    }

    static checkResetPasswordEmail() {
        return [
            query('email', 'Email is required').isEmail()
            .custom((email, {req}) => {
                return User.findOne({
                    email: email
                }).then(user => {
                    if(user) {
                        return true
                    } else {
                        throw('No User Registered with such email')
                    }
                }).catch(e => {
                    throw new Error(e)
                })
            })
        ]
    }

    static verifyResetPasswordToken() {
        return [
            query('email', 'Email is required').isEmail(),
            query('reset_password_token', 'Reset password token is required').isNumeric()
            .custom((reset_password_token, {req}) => {
                return User.findOne({
                    email: req.query.email,
                    reset_password_token: reset_password_token,
                    reset_password_token_time: {$gt: Date.now()}
                }).then(user => {
                    if(user) {
                        return true
                    } else {
                        throw('Reset password token doesn\'t exist. Please regenerate a new token')
                    }
                }).catch(e => {
                    throw new Error(e)
                })
            })
        ]
    }

    static resetPassword() {
        return [
            body('email', 'Email is required').isEmail()
            .custom((email, {req}) => {
                return User.findOne({
                    email: email
                }).then(user => {
                    if(user) {
                        req.user = user
                        return true
                    } else {
                        throw('No User Registered with such email')
                    }
                }).catch(e => {
                    throw new Error(e)
                });
            }),
            body('new_password', 'New Password is required').isAlphanumeric(),
            body('otp', 'Reset Password Token is required').isNumeric()
            .custom((reset_password_token, {req}) => {
                if(req.user.reset_password_token == reset_password_token) {
                    return true
                } else {
                    req.errorStatus = 422
                    throw('Reset Password Token is invalid, please try again')
                }
            })
        ]
    }

    static verifyPhoneNumber() {
        return [
            body('phone', 'Phone is required').isString(),
        ]
    }

    static verifyUserProfile() {
        return [
            body('phone', 'Phone is required').isString(),
            body('new_email', 'Email is required').isEmail()
            .custom((email, {req}) => {
                return User.findOne({
                    email: email
                }).then(user => {
                    if(user) {
                        throw('A user with entered email already exist, please provide a unique email id')
                    } else {
                        return true
                    }
                }).catch(e => {
                    throw new Error(e)
                })
            }),
            body('password', 'Password is required').isAlphanumeric()
        ]
    }

    static verifyCustomerProfile() {
        return[
            body('name', 'Name is required').isString(),
            body('email', 'Email is required').isString()
            .custom((email, {req}) => {
                return User.findOne({
                    email: email
                }).then(user => {
                    if(user) {
                        throw('A User with entered email already exist, please provide a unique email id')
                    } else {
                        return true
                    }
                }).catch(e => {
                    throw new Error(e)
                })
            })
        ]
    }

    static userProfilePic() {
        return [
            body('profileImages', 'Profile image is required')
            .custom((profileImage, {req}) => {
                if(req.file) {
                    return true
                } else {
                    throw('File not uploaded')
                }
            })
        ]
    }

    // static checkRefreshToken() {
    //     return [
    //         body('refreshToken', 'Refresh token is required').isString()
    //         .custom((refreshToken, {req}) => {
    //             if(refreshToken) {
    //                 return true
    //             } else {
    //                 req.errorStatus = 403
    //                 throw('Access is forbidden')
    //             }
    //         })
    //     ]
    // }
}