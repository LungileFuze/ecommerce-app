import {body } from "express-validator"

export class CategoryValidators {

    static addCategory() {
        return [
            body('name', 'Name is required').isString(),
            body('status', 'Status is required').isString()
        ]
    }
   
}