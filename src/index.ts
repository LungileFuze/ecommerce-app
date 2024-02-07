import { Server } from './server'

let server = new Server().app
let port = process.env.PORT || 3000
// process.env.TZ = "Asia/Calcutta"

server.listen(3000, () => {
    console.log(`Server is running at port ${port}`)
})



