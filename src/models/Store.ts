import * as mongoose from 'mongoose'
import {model} from 'mongoose'

const storeSchema = new mongoose.Schema({
    user_id: {type: mongoose.Types.ObjectId, ref: 'users', required: true},
    city_id: {type: mongoose.Types.ObjectId, ref: 'cities', required: true},
    store_name: {type: String, required: true},
    description: {type: String},
    cover: {type: String, required: true},
    location: {type: Object, required: true},
    openTime: {type: String, required: true},
    closeTime: {type: String, required: true},
    address: {type: String, required: true},
    status: {type: String, required: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()}

})

export default model('stores', storeSchema)