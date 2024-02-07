import SubCategory from "../models/SubCategory"

export class SubCategoryController {

    static async getSubCategories(req, res, next) {
        try {
            const sub_categories = await SubCategory.find({}, {__v: 0})
            res.send(sub_categories)
        } catch(e) {
            next(e)
        }
    }

    static async addSubCategory(req, res, next) {
        const name = req.body.name
        const status = req.body.status
        const category_id = req.body.category_id
        try {
            let data: any = {
                category_id,
                name,
                status
            }
            if(req.file) data = {...data, photo: req.file.path}
            const sub_category = await new SubCategory(data).save()
            res.send(sub_category)
        } catch (e) {
            next(e)
        }
    }
}