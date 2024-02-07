import { Router } from "express";
import { GlobalMiddleWare } from "../middlewares/GlobalMiddleWare";
import { SubCategoryController } from "../controllers/SubCategoryControlller";
import { Utils } from "../utils/Utils";
import { SubCategoryValidators } from "../validators/SubCategoryValidators";

class SubCategoryRouter {

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
        this.router.get('/getSubCategories', GlobalMiddleWare.auth, SubCategoryController.getSubCategories)
    }
    postRoutes() {
        this.router.post('/create', GlobalMiddleWare.auth, GlobalMiddleWare.adminRole, new Utils().multer.single('subcategoryImages'),SubCategoryValidators.addSubCategory(), GlobalMiddleWare.checkError, SubCategoryController.addSubCategory)
    }
    patchRoutes() {}
    putRoutes() {}
    deleteRoutes() {}
}

export default new SubCategoryRouter().router