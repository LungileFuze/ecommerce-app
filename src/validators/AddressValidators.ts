import { body, query } from 'express-validator'

export class AddressValidators {

    static addAddress() {
        return[
            body('title', 'Title is required').isString(),
            body('landmark', 'Landmark is required').isString(),
            body('address', 'Address is required').isString(),
            body('house', 'House Number is required').isString(),
            body('lat', 'Latitude isrequired').isNumeric(),
            body('lng', 'Latitude is required').isNumeric()
        ]
    }

    static editAddress() {
        return [
            body('title', 'Title is required').isString(),
            body('landmark', 'Landmark is required').isString(),
            body('address', 'Address is required').isString(),
            body('house', 'House Number is required').isString(),
            body('lat', 'Latitude isrequired').isNumeric(),
            body('lng', 'Latitude is required').isNumeric()
        ]
    }

    static checkAddress() {
        return [
            query('lat', 'Latitude isrequired').isNumeric(),
            query('lng', 'Latitude is required').isNumeric()
        ]
    }

    static getLimitedAddresses() {
        return[
            query('limit', 'Address limit is required').isNumeric()
        ]
    }

}