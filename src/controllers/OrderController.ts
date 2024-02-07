import Cart from "../models/Cart"
import Item from "../models/Item"
import Order from "../models/Order"
import { Stripe } from "../utils/Stripe"


export class OrderController {

    static async placeOrder(req, res, next) {
        const data = req.body
        const user_id = req.user_id
        try {
            if(req.user.type != 'user') {
                throw('You are not authorized to place an order')
            }
            let orderData: any = {
                user_id,
                products: JSON.parse(data.products),
                address: data.address,
                status: data.status,
                payment_status: data.payment_status,
                payment_mode: data.payment_mode,
                total: data.total,
                grandTotal: data.grandTotal,
                deliveryCharge: data.deliveryCharge
            }
            if(data.instruction) orderData = {...orderData, instruction: data.instruction}
            const order = await new Order(orderData).save()
            await Cart.findOneAndDelete(user_id)

            req.server_products.map(async(server_product) => {
                let product = orderData.products.find(x => x._id == server_product._id)
                if(server_product.variations?.length == 0) {
                    await Item.findByIdAndUpdate(
                        product._id,
                        {
                            $inc: { stock_unit: (-1) * product.quantity, 'metrics.orders': 1}
                        }
                    )
                } else {
                    let variation = server_product.variations.find(variation => variation.sku && variation.sku == product.sku)
                    if(variation) {
                        await Item.findOneAndUpdate(
                            {
                                _id: product._id,
                                "variations.sku": product.sku
                            },
                            {
                                $inc: { "variations.$.stock_unit" : (-1) * product.quantity, "metrics.orders": 1}
                            }
                        )
                    } else {
                        await Item.findOneAndUpdate(
                            {
                                _id: product._id,
                                "variations.size.sku": product.sku
                            },
                            {
                                $inc: { "variations.$.size.stock_unit" : (-1) * product.quantity, "metrics.orders": 1}
                            }
                        )
                    }
                }
            })

            const response_order = {
                address: order.address,
                products: order.products,
                instruction: order.instruction || null,
                grandTotal: order.grandTotal,
                total: order.total,
                deliveryCharge: order.deliveryCharge,
                status: order.status,
                payment_status: order.payment_status,
                payment_mode: order.payment_mode,
                create_at: order.created_at,
                updated_at: order.updated_at
            }
            res.send(response_order)
        }catch(e) {
            next(e)
        }
    }

    static async getUserOrders(req, res, next) {
        const user_id = req.user.aud
        const perPage = 5
        const currentPage = parseInt(req.query.page) || 1
        const prevPage = currentPage == 1 ? null : currentPage -1
        let nextPage = currentPage + 1
        try {
            const orders_doc_count = await Order.countDocuments({user_id: user_id})
                //send empty array if no documenton filterquery exists
                if(!orders_doc_count) {
                    res.json({
                        orders: [],
                        perPage,
                        currentPage,
                        prevPage,
                        nextPage: null,
                        totalPages: 0,
                        // totalRecords: orders_doc_count
                    })
                }
            const totalPages = Math.ceil(orders_doc_count / perPage)
            if(totalPages == 0 || totalPages === currentPage) {
                nextPage = null
            }
            if(totalPages < currentPage) {
                throw('No more Orders available')
            }

            const orders = await Order.find({user_id}, {user_id: 0, __v: 0})
            .skip((perPage * currentPage) - perPage)
            .limit(perPage)
            .sort({ 'created_at': -1})
            .exec()
            // res.send(orders)
            res.json({
                orders,
                perPage,
                currentPage,
                prevPage,
                nextPage,
                totalPages,
                // totalRecords: orders_doc_count
            })
        } catch(e) {
            next(e)
        }
    }

    static async stripeCheckout(req, res, next) {
        const data = req.body

        try {
            let orderData: any = {
                items: JSON.parse(data.order),
                deliveryCharge: data.deliveryCharge
            }
            const session = await Stripe.checkout(orderData)
            res.send(session)
        }catch(e) {
            next(e)
        }
    }
}