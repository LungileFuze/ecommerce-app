import { Router } from "express";
import { GlobalMiddleWare } from "../middlewares/GlobalMiddleWare";
import { CartController } from "../controllers/CartController";
import { CartValidators } from "../validators/CartValidators";

class CartRouter {

    public router: Router

    constructor() {
        this.router = Router()
        this.getRouter()
        this.postRouter()
        this.patchRouter()
        this.putRouter()
        this.deleteRouter()
    }

    getRouter() {
        this.router.get('/getCart', GlobalMiddleWare.auth, CartController.getUserCart)
    }
    postRouter() {
        this.router.post('/create', GlobalMiddleWare.auth, CartValidators.addToCart(), GlobalMiddleWare.checkError, CartController.addToCart)
    }
    patchRouter() {}
    putRouter() {}
    deleteRouter() {}
}

export default new CartRouter().router