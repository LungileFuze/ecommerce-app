import * as mongoose from 'mongoose'
import { model } from 'mongoose'

const BannerSchema = new mongoose.Schema({
    banner: {type: String, required: true},
    status: {type: Boolean, required: false, default: true},
    created_at: {type: Date, required: true, default: new Date()},
    updated_at: {type: Date, required: true, default: new Date()}
})

export default model('banners', BannerSchema)