import * as express from "express"
import * as mongoose from "mongoose"
import * as bodyParser from "body-parser"
import * as cors from 'cors'
import { getEnvironmentVariables } from "./environments/environment"
import UserRouter from "./routers/UserRouter";
import BannerRouter from "./routers/BannerRouter"
import CityRouter from "./routers/CityRouter"
import CategoryRouter from "./routers/CategoryRouter"
import ItemRouter from "./routers/ItemRouter"
import AddressRouter from "./routers/AddressRouter"
import OrderRouter from "./routers/OrderRouter"
import { Utils } from "./utils/Utils"
import { Redis } from "./utils/Redis"
import SubCategoryRouter from "./routers/SubCategoryRouter"
import StoreRouter from "./routers/StoreRouter"
import CartRouter from "./routers/CartRouter"

export class Server {

    public app: express.Application = express()

    constructor() {
        this.setConfigs();
        this.setRoutes();
        this.error404Handler()
        this.handleErrors()
    }

    setConfigs() {
        this.dotenvConfigs()
        this.connectMongoDB()
        this.connectRedis()
        this.configureBodyParser()
        this.allowCors()

    }

    dotenvConfigs() {
        // dotenv.config({path: '.env'})
        Utils.dotenvConfigs()
    }

    connectMongoDB() {
            mongoose.connect(getEnvironmentVariables().db_uri)
                .then(() => {
            console.log('connected to mongodb')
        })
    }

    async connectRedis() {
        Redis.connectToRedis()

        // await Redis.setValue('lulu', 'coding')
        // const value = await Redis.getValue('lulu')
        // console.log(value)

        // Redis.delKey('lulu')
    }

    configureBodyParser() {
        this.app.use(bodyParser.urlencoded({
            extended: true
        }))

        // this.app.use(bodyParser.json())
        
    }

    allowCors() {
        this.app.use(cors())
    }

    setRoutes() {
        this.app.use('/src/uploads', express.static('src/uploads'))
        this.app.use('/api/user', UserRouter)
        this.app.use('/api/banner', BannerRouter)
        this.app.use('/api/city', CityRouter)
        this.app.use('/api/store', StoreRouter)
        this.app.use('/api/category', CategoryRouter)
        this.app.use('/api/subcategory', SubCategoryRouter)
        this.app.use('/api/product', ItemRouter)
        this.app.use('/api/cart', CartRouter)
        this.app.use('/api/address', AddressRouter)
        this.app.use('/api/order', OrderRouter)
    }

    error404Handler() {
        this.app.use((req, res) => {
            res.status(404).json({
                message: 'Not found',
                status_code: 404
            })
        })
    }

    handleErrors() {
        this.app.use((error, req, res, next) => {
            const errorStatus = req.errorStatus || 500;
            res.status(errorStatus).json({
                message: error.message || 'Something went wrong, Please try again',
                status_code: errorStatus
            })
        })
    }

}