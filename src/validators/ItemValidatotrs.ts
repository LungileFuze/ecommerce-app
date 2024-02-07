import { body, query } from "express-validator"
import Store from "../models/Store"
import Category from "../models/Category"


export class ItemValidators {

    static addItem() {
        return [
            // body('productImages', 'Cover image is required')
            // .custom((images, {req}) => {
            //     if(req.file) {
            //         return true
            //     } else {
            //         throw('File not uploaded')
            //     }
            // }),
            body('name', 'Product Name is required').isString(),
            body('store_id', 'Store Id is required').isString()
            .custom((store_id, {req}) => {
                return Store.findById(store_id).then(store => {
                    if(store) {
                        if(req.user.type == 'admin' || store.user_id == req.user.aud)
                        return true
                        throw('You are not an authorized user')
                    } else {
                        throw('Store doesnt exist')
                    }
                }).catch(e => {
                    throw new Error(e)
                })
            }),
            // body('category_id', 'Category Id is required').isString()
            // .custom((category_id, {req}) => {
            //     return Category.findOne({category_id: category_id, store_id: req.body.store_id})
            //     .then(category => {
            //         if(category) {
            //             return true
            //         } else {
            //             throw('Category doesnt exist')
            //         }
            //     }).catch(e => {
            //         throw new Error(e)
            //     })
            // }),
            body('price', 'Price is required').isString(),
            body('status', 'Status is required').isBoolean(),
           
        ]
    }

    static getProductsByCategory() {
        return [
            query('category_id', 'Category is required').isString()
        ]
    }
}