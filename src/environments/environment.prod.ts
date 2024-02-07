import { Utils } from "../utils/Utils";
import { Environment } from "./environment";

Utils.dotenvConfigs()

export const ProdEnvironment: Environment = {
    db_uri: process.env.PROD_DB_URI,
    jwt_secret_key: process.env.PROD_JWT_SECRET_KEY,
    jwt_refresh_secret_key: process.env.PROD_REFRESH_SECRET_KEY,

    sendgrid: {
        api_key: '',
        email_from: '',
    },

    gmail_auth: {
        user: process.env.PROD_GMAIL_USER,
        pass: process.env.DEV_GMAIL_PASS
    },

    
    postmark: {
        api_key: process.env.PROD_POSTMARK_API_KEY,
        email_from: process.env.DEV_POSTMARK_SENDER_EMAIL,
    },

    redis: {
        username: process.env.SERVER_REDIS_USERNAME,
        password: process.env.SERVER_REDIS_PASSWORD,
        host: process.env.SERVER_REDIS_HOST,
        port: parseInt(process.env.SERVER_REDIS_PORT)
    },

    stripe: {
        publishable_key: process.env.PROD_STRIPE_PUBLISHABLE_KEY,
        secret_key: process.env.PROD_STRIPE_SECRET_KEY
    }
}