import { Router } from "express";
import { CityValidators } from "../validators/CityValidators";
import { GlobalMiddleWare } from "../middlewares/GlobalMiddleWare";
import { CityController } from "../controllers/CityController";

class CityRouter {

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
        this.router.get('/cities', CityController.getCities)
    }

    postRoutes() {
        this.router.post('/create', CityValidators.addCity(), GlobalMiddleWare.checkError, CityController.addCity)
    }

    patchRoutes() {}
    putRoutes() {}
    deleteRoutes() {}
}

export default new CityRouter().router