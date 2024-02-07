import stripe from 'stripe'
import { getEnvironmentVariables } from '../environments/environment'

export class Stripe {

    private static _stripe = new stripe(getEnvironmentVariables().stripe.secret_key, {apiVersion: '2023-10-16'})


    static async checkout(data: {items: any[], deliveryCharge: number}) {
       try {
        const session = await Stripe._stripe.checkout.sessions.create({
            line_items: [
                ...data.items.map(item => ({
                    price_data: {
                        currency: 'ZAR',
                        product_data: {
                            name: item.name,
                            images: ['http://localhost:3000' + item.cover]
                        },
                        unit_amount: item.price * 100,
                    },
                    quantity: item.quantity,
                })),
                {
                    price_data: {
                        currency: 'ZAR',
                        product_data: {
                            name: 'Delivery charge'
                        },
                        unit_amount: data.deliveryCharge * 100,
                    },
                    quantity: 1,
                },
            ],
            // node: 'payment',
            // success_url: 'http://localhost:4200/success',
            // cancel_url: 'http://localhost:4200/cancel',
        });
        return session
       }catch(e) {
        throw(e)
       }
    }

}