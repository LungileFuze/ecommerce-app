import { body } from "express-validator";

export class CartValidators {
    static addToCart() {
        return [
            body('products', 'Product Items is required').isString(),
            body('status', 'Order Status is required').isString(),
            body('total', 'Cart total is required').isNumeric
        ]
    }
}