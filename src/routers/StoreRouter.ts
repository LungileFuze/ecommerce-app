import { Router } from "express";
import { GlobalMiddleWare } from "../middlewares/GlobalMiddleWare";
import { StoreController } from "../controllers/StoreController";
import { StoreValidators } from "../validators/StoreValidators";
import { Utils } from "../utils/Utils";


class StoreRouter {

    public router: Router

    constructor() {
        this.router = Router()
        this.getRoutes()
        this.postRoutes()
        this.patchRoutes()
        this.putRoutes()
        this.deleteRoutes()
    }

    getRoutes() {
        this.router.get('/getStores', GlobalMiddleWare.auth, GlobalMiddleWare.adminRole,GlobalMiddleWare.checkError, StoreController.getStores)
        this.router.get('/searchStores', GlobalMiddleWare.auth,StoreValidators.searchStores(),GlobalMiddleWare.checkError, StoreController.searchStores)
    }

    postRoutes() {
        this.router.post('/create', GlobalMiddleWare.auth, GlobalMiddleWare.adminRole, new Utils().multer.single('storeImages'), StoreValidators.addStore(), GlobalMiddleWare.checkError, StoreController.addStore)
    }

    patchRoutes() {}

    putRoutes() {}

    deleteRoutes() {}
}

export default new StoreRouter().router