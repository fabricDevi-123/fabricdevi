require("dotenv").config()
let http = require("http")
let express = require("express")
let bodyParser = require("body-parser")
const cors = require("cors")
const { dbCoonect } = require("./config/dbConnect")
const routes = require("./ROUTES")

let app = express()
app.use(cors());
app.use(bodyParser.json())
dbCoonect()
app.use("/v1", routes)


http.createServer(app).listen(process.env.PORT, () => {
    console.log(`SERVER STARTED ON ${process.env.PORT}`);
})