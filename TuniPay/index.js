const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
var cors = require("cors")
const User = require('./models/users')
const errorMiddleware = require("./middlewares/error")
const { isAuthenticatedUser } = require("./middlewares/auth")
const { onlyAdminAccess } = require("./middlewares/adminMiddleware")
const morgan = require('morgan');

const app = express()
dotenv.config()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'));


const dbURL = process.env.DBCONNECTION
mongoose.set("strictQuery", false)
const db = "TuniPay"

app.get('/', (req, res) => {

    return res.send("Welcome From TuniPay Node Server!")

})

mongoose
.connect(dbURL)
.then((result) => {
    app.listen(3000)     
    console.log("Listening to port 3000 and database is connected!")

})
.catch((err) => console.log(err))




// app.use("/api/users", require("./routes/usersRoutes"))
// app.use("/api/admins", require("./routes/adminRoutes"))
app.use("/api/aliExpress", require("./routes/aliExpress"))
app.use("/api/shein", require("./routes/shein"))

app.use("/api", require("./routes/authRoutes"))
// app.use("/api/admin", require("./routes/adminRoutes"))
app.use("/api", require("./routes/userRoutes"))

// app.use("/api", require("./routes/tempRoutes"))

app.use("/api", require("./routes/chat"))
app.use("/api", require("./routes/order"))
app.use("/api", require("./routes/giftCard"))

// app.get('/api/admin/all-routes', isAuthenticatedUser, onlyAdminAccess, getAllRoutes)



//middleware for error
app.use(errorMiddleware)
