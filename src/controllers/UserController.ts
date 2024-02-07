import User from "../models/User";
import { Utils } from "../utils/Utils";
import { NodeMailer } from "../utils/NodeMailer";
import {Jwt} from '../utils/Jwt'
import { Redis } from "../utils/Redis";


export class UserController {

    static async registerUserViaPhone(req, res, next) {
        const phone = req.query.phone
        let user = req.user
        const verification_token = Utils.generateVerificationToken(4)
        try {
         if(!user) {
            const data = {
                phone,
                type: 'user',
                status: 'inactive',
                verification_token,
                verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME
            }
            user = await new User(data).save()
            if(!user) throw new Error('User not register, Please try again')
         }
            const user_data = {
                email: user.email || null,
                account_verified: user.account_verified,
                phone: user.phone,
                name: user.name || null,
                photo: user.photo || null,
                type: user.type,
                status: user.status,
                created_at: user.created_at,
                updated_at: user.updated_at
            }
            const payload = {
                phone: user.phone,
                type: user.type
            }
            //filter user data to pass in front end
            const access_token = Jwt.jwtSign(payload, user._id)
            const refresh_token = await Jwt.jwtSignRefreshToken(payload, user._id)
            res.json({
                token: access_token,
                refresh_token: refresh_token,
                user: user_data,
            })
            // //send OPT to registered number
            // await NodeMailer.sendMail({
            //     to: [user.email],
            //     subject: 'Resend Email Validation',
            //     html: `<h1> Your otp is ${verification_token}<h1>`
            // })
        } catch (e){
            next(e)
        }

    }

    static async otpLogin(req, res, next) {
        const phone = req.query.phone
        const otp = req.query.otp
        try {
            const user = await User.findOneAndUpdate(
                {
                    phone,
                    verification_token: otp,
                    verification_token_time: {$gt: Date.now()}
                },
                {
                    account_verified: true,
                    updated_at: new Date()
                },
                {
                    new: true,
                    projection: {
                        verification_token: 0,
                        verification_token_time: 0,
                        password: 0,
                        reset_password_token: 0,
                        reset_password_token_time: 0,
                        __v: 0,
                        // _id: 0
                    }
                }
            )
            if(!user) {
                throw new Error('Wrong OTP or OTP is expired. Please try again...')
            }
            const user_data = {
                email: user.email || null,
                account_verified: user.account_verified,
                phone: user.phone,
                name: user.name || null,
                photo: user.photo || null,
                type: user.type,
                status: user.status,
                created_at: user.created_at,
                updated_at: user.updated_at
            }
            const payload = {
                phone: user.phone,
                type: user.type
            }
            //filter user data to pass in front end
            const access_token = Jwt.jwtSign(payload, user.id)
            const refresh_token = await Jwt.jwtSignRefreshToken(payload, user.id)
            res.json({
                token: access_token,
                refresh_token: refresh_token,
                user: user_data,
            })
        } catch(e) {
            next(e)
        }
    }

    static async signup(req, res, next) {
        console.log('req: ', req)
        const name = req.body.name;
        const phone = req.body.phone;
        const email = req.body.email;
        const password = req.body.password;
        const type = req.body.type;
        const status = req.body.status;
        const verification_token = Utils.generateVerificationToken()

        try {
            const hash = await Utils.encryptPassword(password)

            const data = {
                email,
                verification_token,
                verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
                phone,
                password: hash,
                name,
                type,
                status
            }
                const user = await new User(data).save()
                const user_data = {
                    email: user.email,
                    account_verified: user.account_verified,
                    phone: user.phone,
                    name: user.name,
                    photo: user.photo || null,
                    type: user.type,
                    status: user.status,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                }

                const payload = {
                    // user_id: user._id,
                    // aud: user._id,
                    email: user.email,
                    type: user.type
                };
                const token = Jwt.jwtSign(payload, user.id)
                const refresh_token = Jwt.jwtSign(payload, user.id)

                res.json({
                    token: token,
                    refreshToken: refresh_token,
                    user: user_data
                })
                //Send a user a verification email
                await NodeMailer.sendMail({
                    to: [user.email],
                    subject: 'Email verification',
                    html: `<h1> Your Otp is ${verification_token}</h1>`
                })
                
            } catch(e) {
                next(e)
            }
    }

    static async verifyUserEmailToken(req, res, next) {
        const verification_token = req.body.verification_token
        const email = req.user.email

        try {
            const user = await User.findOneAndUpdate(
                {
                    email: email,
                    verification_token: verification_token,
                    verification_token_time: {$gt: Date.now()}
                },
                {
                    account_verified: true,
                    updated_at: new Date()
                },
                {
                    new: true,
                    projection: {
                        verification_token: 0,
                        verification_token_time: 0,
                        password: 0,
                        reset_password_token: 0,
                        reset_password_token_time: 0,
                        __v: 0,
                        _id: 0
                    }
                }
            );
            if(user) {
                res.send(user)
            } else {
                throw new Error('Email verification token is required. Please try again...')
            }
        } catch (e) {
            next(e)
        }
    }

    static async resendVerificationEmail(req, res, next) {
        const email = req.user.email
        const verification_token = Utils.generateVerificationToken()
        try {
            const user = await User.findOneAndUpdate(
                {email: email},
                {
                    updated_at: new Date(),
                    verification_token: verification_token,
                    verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME
                }
            );
            if(user) {
                res.json({success: true})
                await NodeMailer.sendMail({
                    to: [user.email],
                    subject: "Resend Email Verification",
                    html: `<h1>Your Otp is ${verification_token}</h1>`
                });
            } else {
                throw new Error('User doesn\'t exists')
            }

        } catch (e) {
            next(e)
        }
    }

    static async login(req, res, next) {
        const user = req.user
        const password = req.query.password
      
        const data = {
            password,
            encrypt_password: user.password
        }

        try {
            await Utils.comparePassword(data)
            const payload = {
                // user_id: user._id,
                // aud: user._id,
                email: user.email,
                type: user.type
            }
            const token = Jwt.jwtSign(payload, user.aud)
            const refresh_token = await Jwt.jwtSignRefreshToken(payload, user._id) 

            const user_data = {
                email: user.email,
                account_verified: user.account_verified,
                phone: user.phone,
                photo: user.photo || null,
                name: user.name,
                type: user.type,
                status: user.status,
                created_at: user.created_at,
                updated_at: user.updated_at
            }
            res.json({
                token: token,
                refreshToken: refresh_token,
                user: user_data
            })
        } catch (e) {
            next(e)
        }
    }

    static async sendResetPasswordOtp(req, res, next) {
        const email = req.query.email
        const reset_password_token = Utils.generateVerificationToken()
        try {
            const user = await User.findOneAndUpdate(
                {email: email},
                {
                    updated_at: new Date(),
                    reset_password_token: reset_password_token,
                    reset_password_token_time: Date.now() + new Utils().MAX_TOKEN_TIME
                }
            );
            if(user) {
                res.json({ success: true })
                await NodeMailer.sendMail({
                    to: [user.email],
                    subject: 'Reset password email verification OTP',
                    html: `<h1>Your OTP is ${reset_password_token}</h1>`
                });
                
            } else {
                throw new Error('User doesn\'t exist')
            }
        } catch(e) {
            next(e)
        }
    }

    static async verifyResetPasswordToken(req, res, next) {
            res.json({success: true})
    }

    static async resetPassword(req, res, next) {
        const user = req.user
        const new_password = req.body.new_password
        try {
            const encrypt_password = await Utils.encryptPassword(new_password)
            const updateUser = await User.findByIdAndUpdate(
                user._id,
                {
                    updated_at: new Date(),
                    password: encrypt_password
                },
                {
                    new: true,
                    projection: {
                        verification_token: 0,
                        verification_token_time: 0,
                        password: 0,
                        reset_password_token: 0,
                        reset_password_token_time: 0,
                        __v: 0,
                        _id: 0
                    }
                }
            )
            if(updateUser) {
                res.send(updateUser)
            } else {
                throw new Error('User doesn\'t exist')
            }
        } catch(e) {
            next(e)
        }
        
    }

    static async profile(req, res, next) {
        const user = req.user;
        try {
            const profile = await User.findById(user.aud)
            if(profile) {
                const user_data = {
                    email: profile.email,
                    account_verified: profile.account_verified,
                    phone: profile.phone,
                    photo: user.photo || null,
                    name: profile.name,
                    type: profile.type,
                    status: profile.status,
                    created_at: profile.created_at,
                    updated_at: profile.updated_at
                }
                res.send(user_data)
            } else {
                throw new Error('User does\'t exist')
            }
        }catch(e) {
            next(e)
        }
    }

    static async updatePhoneNumber(req, res, next) {
        const user = req.user
        const phone = req.body.phone
        try {
            const userData = await User.findByIdAndUpdate(
                user.aud,
                {phone: phone, updated_at: new Date()},
                {
                    new: true,
                    projection: {
                        verification_token: 0,
                        verification_token_time: 0,
                        password: 0,
                        reset_password_token: 0,
                        reset_password_token_time: 0,
                        __v: 0,
                        _id: 0
                    }
                }
            )
            res.send(userData)
        } catch(e) {
            next(e)
        }
    }

    static async updateUserProfile(req, res, next) {
        const user = req.user
        const phone = req.body.phone
        const new_email = req.body.email
        const plain_password = req.body.password
        const verification_token = Utils.generateVerificationToken()
        try {
            const userData = await User.findById(user.aud)
            if(!userData) throw new Error('User doesn\'t exists')
            await Utils.comparePassword({
                password: plain_password,
                encrypt_password: userData.password
            })
            const updatedUser = await User.findByIdAndUpdate(
                user.aud,
                {
                    phone: phone,
                    email: new_email,
                    account_verified: false,
                    verification_token,
                    verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
                    updated_at: new Date()
                },
                {
                    new: true,
                    projection: {
                        verification_token: 0,
                        verification_token_time: 0,
                        password: 0,
                        reset_password_token: 0,
                        reset_password_token_time: 0,
                        __v: 0,
                        _id: 0
                    }
                }
            )
            const payload = {
                // aud: user.aud,
                email: updatedUser.email,
                type: updatedUser.type
            }
            const token = Jwt.jwtSign(payload, user.aud)
            const refresh_token = await Jwt.jwtSignRefreshToken(payload, user._id)
            res.json({
                token: token,
                refreshToken:refresh_token,
                user: updatedUser
            })
            await NodeMailer.sendMail({
                to: [updatedUser.email],
                subject: 'Email Verification',
                html: `<h1>Your Otp is ${verification_token} </h1>`
            })
            res.send(userData)

        }catch(e) {
            next(e)
        }
    }

    static async updateCustomerProfile(req, res, next) {
        const user = req.user
        const name = req.body.name
        const email = req.body.email
        try{
            const userData = await User.findById(user.aud)
            if(!userData) throw new Error('User doesnt exist')
            const updateUser = await User.findByIdAndUpdate(
                user.aud,
                {
                    name: name,
                    email: email,
                    updated_at: new Date()
                },
                {
                    new: true,
                    projection: {
                        verification_token: 0,
                        verification_token_time: 0,
                        password: 0,
                        reset_password_token: 0,
                        reset_password_token_time: 0,
                        __v: 0,
                        _id: 0
                    }
                }
        )
        res.json({
            user: updateUser
        })
        }catch(e) {
            next(e)
        }
    }

    static async getNewTokens(req, res, next) {
        const refreshToken = req.body.refreshToken
        const decoded_data = await Jwt.jwtVerifyRefreshToken(refreshToken)
        try {
            if(decoded_data) {
                const payload = {
                    email: decoded_data.email,
                    type: decoded_data.type
                }
                const access_token = Jwt.jwtSign(payload, decoded_data.aud)
                const refresh_token = await Jwt.jwtSignRefreshToken(payload, decoded_data.aud)
                res.json({
                    accessToken: access_token,
                    refreshToken: refresh_token
                })
            } else {
                req.errorStatus = 403
                throw('Access is forbidden')
            }
        } catch (e) {
            req.errorStatus = 403
            next(e)
        }
    }

    static async logout(req,res, next) {
        const refreshToken = req.body.refreshToken
        const decoded_data = req.user
        try {
            if(decoded_data) {
                //delete refreshtoken from redis database
                await Redis.deleteKey(decoded_data.aud)
                res.json({success: true})
            } else {
                req.errorStatus = 403
                throw('Access is forbidden')
            }
        } catch(e) {
            req.errorStatus = 403
            next(e)
        }
    }

    static async updateUserProfilePic(req, res, next) {
        const path = req.file.path
        const user = req.user
        try {
            const updatedUser = await User.findByIdAndUpdate(
                user.aud,
                {
                    photo: path,
                    updated_at: new Date()
                },
                {
                    new: true,
                    projection: {
                        verification_token: 0,
                        verification_token_time: 0,
                        password: 0,
                        reset_password_token: 0,
                        reset_password_token_time: 0,
                        __v: 0,
                        _id: 0
                    }
                }
            )
            res.send(updatedUser)
        } catch (e) {
            next(e)
        }
    }
}