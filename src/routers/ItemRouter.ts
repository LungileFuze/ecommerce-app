import { Router } from "express";
import { GlobalMiddleWare } from "../middlewares/GlobalMiddleWare";
import { ItemValidators } from "../validators/ItemValidatotrs";
import { Utils } from "../utils/Utils";
import { ItemController } from "../controllers/ItemController";

class ItemRouter {

    public router: Router

    constructor() {
        this.router = Router()
        this.getRoutes()
        this.postRoutes()
        this.patchRouter()
        this.putRouter()
        this.deleteRouter()
    }

        getRoutes() {
            this.router.get('/getbyCategory', GlobalMiddleWare.auth, ItemValidators.getProductsByCategory(),GlobalMiddleWare.checkError, ItemController.getProductsByCategory)
        }
        postRoutes() {
            this.router.post('/create', GlobalMiddleWare.auth, GlobalMiddleWare.adminOrStoreRole, new Utils().multer.array('productImages'), ItemValidators.addItem(), GlobalMiddleWare.checkError, ItemController.addItem)
        }
        patchRouter() {}
        putRouter() {}
        deleteRouter() {}
}

export default new ItemRouter().router