import { body } from "express-validator";

export class CityValidators {

    static addCity() {
        return [
            body('name', 'City Name is required').isString(),
            body('lat', 'Latitude Name is required').isNumeric(),
            body('lng', 'Longitude Name is required').isNumeric(),
            body('status', 'City Name is required').isString()
        ]
    }
}