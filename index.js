require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const ideaRoutes = require("./routes/ideaRoutes")
const userRoutes = require('./routes/userRoutes')
const errorHandler = require("./middlewares/errorMiddleware")

const app = express()
const PORT = process.env.PORT || 4400

app.use(express.json())

// routes
app.use("/auth", userRoutes)
app.use("/idea", ideaRoutes)

// Error Handler
app.use(errorHandler)

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => { app.listen(PORT, () => { console.log(`Server running on port ${PORT}`) }) })
    .catch((error) => console.log(error))