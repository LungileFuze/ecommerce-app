import { GlobalMiddleWare } from "../middlewares/GlobalMiddleWare";
import { Router } from "express";
import { Utils } from "../utils/Utils";
import { BannerValidators } from "../validators/BannerValidators";
import { BannerController } from "../controllers/BannerController";

class BannerRouter {

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
        this.router.get('/banners', GlobalMiddleWare.auth, BannerController.getBanners)
    }

    postRouter() {
        this.router.post('/create', GlobalMiddleWare.auth, GlobalMiddleWare.adminRole,new Utils().multer.single('banner'), BannerValidators.addBanner(), BannerController.addBanner)
    }
    patchRouter() {}
    putRouter() {}
    deleteRouter() {}
}

export default new BannerRouter().router