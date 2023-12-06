require('dotenv').config()
const express = require('express')
const ideaRoutes = require("./routes/ideaRoutes")
const mongoose = require('mongoose')

const app = express()
const PORT = process.env.PORT || 4400

app.use(express.json())

app.use("/idea", ideaRoutes)

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => { app.listen(PORT, () => { console.log(`Server running on port ${PORT}`) }) })
    .catch((error) => console.log(error))