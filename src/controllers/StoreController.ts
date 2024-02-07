import Store from "../models/Store";
import User from "../models/User";
import { Utils } from "../utils/Utils";

export class StoreController{

    static async addStore(req, res, next)  {
        const store = req.body
        // const path = req.file.path
        const verification_token = Utils.generateVerificationToken()
        try {
            //create store user
            const hash = await Utils.encryptPassword(store.password)
            let data: any = {
                email: store.email,
                verification_token,
                verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
                phone: store.phone,
                password: hash,
                store_name: store.store_name,
                type: 'store',
                status: 'active'
            }
            const user = await new User(data).save()
            
            //create store
            let store_data: any = {
                store_name: store.store_name,
                location: JSON.parse(store.location),
                address: store.address,
                status: store.status,
                city_id: store.city_id,
                user_id: user._id,
            };
            if(req.file) store_data = {...store_data, cover: req.file.path}
            if(store.description) store_data = {...store_data, description: store.description}
            if(store.openTime) store_data = {...store_data, openTime: store.openTime}
            if(store.closeTime) store_data = {...store_data, closeTime: store.closeTime}
            const storeDoc = await new Store(store_data).save()

            res.send(storeDoc)
        }catch(e) {
            next(e)
        }
    }

    static async getStores(req, res, next) {
        // const METERS_PER_MILE = 1609.34
        const data = req.query
        // const METERS_PER_KM = 1000
        // const  EARTH_RADIUS_IN_MILE = 3963.2
        const  EARTH_RADIUS_IN_KM = 6378.1
        try {
            const restuarants = await Store.find(
                {
                    status: 'active',
                    location: {
                        // $nearSphere: {
                        //     $geometry:
                        //     {
                        //         type: "Point",
                        //         coordinates: [ parseFloat(data.lng), parseFloat(data.lat) ]
                        //     },
                        //     $maxDistance: data.radius * METERS_PER_KM
                        // }

                        $geoWithin: {
                            $centerSphere: [
                                [parseFloat(data.lng), parseFloat(data.lat)],
                                (parseFloat(data.radius)/1.6) / EARTH_RADIUS_IN_KM
                            ]
                        }
                    }
                })
            res.send(restuarants)
        } catch (e) {
            next(e)
        }
    }

    static async searchStore(req, res, next) {
        // const METERS_PER_MILE = 1609.34
        const data = req.query
        // const METERS_PER_KM = 1000
        // const  EARTH_RADIUS_IN_MILE = 3963.2
        const  EARTH_RADIUS_IN_KM = 6378.1
        try {
            const restuarants = await Store.find(
                {
                    status: 'active',
                    name: {$regex: data.name, $options: 1},
                    location: {
                        // $nearSphere: {
                        //     $geometry:
                        //     {
                        //         type: "Point",
                        //         coordinates: [ parseFloat(data.lng), parseFloat(data.lat) ]
                        //     },
                        //     $maxDistance: data.radius * METERS_PER_KM
                        // }

                        $geoWithin: {
                            $centerSphere: [
                                [parseFloat(data.lng), parseFloat(data.lat)],
                                (parseFloat(data.radius)/1.6) / EARTH_RADIUS_IN_KM
                            ]
                        }
                    }
                })
            res.send(restuarants)
        } catch (e) {
            next(e)
        }
    }

    static async searchStores(req, res, next) {
        try {
            const restuarants = await Store.find(
                {
                    status: 'active'
                }
            )
            res.send(restuarants)
        }catch(e) {
            next(e)
        }
    }
}