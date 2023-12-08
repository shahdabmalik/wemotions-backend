require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const ideaRoutes = require("./routes/ideaRoutes")
const userRoutes = require('./routes/userRoutes')
const entityRoutes = require('./routes/entityRoutes')
const errorHandler = require("./middlewares/errorMiddleware")

const app = express()
const PORT = process.env.PORT || 4400

// middlewares
app.use(express.json())

// routes
app.use("/api/auth", userRoutes)
app.use("/api/idea", ideaRoutes)
app.use("/api/entity", entityRoutes)

// Error Handler
app.use(errorHandler)

// Connect database and start server
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => { app.listen(PORT, () => { console.log(`Server running on port ${PORT}`) }) })
    .catch((error) => console.log(error))