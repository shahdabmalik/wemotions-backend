require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const ideaRoutes = require("./routes/ideaRoutes")
const userRoutes = require('./routes/userRoutes')
const entityRoutes = require('./routes/entityRoutes')
const contactRoutes = require('./routes/contactRoute')
const adminRoutes = require('./routes/adminRoutes')
const errorHandler = require("./middlewares/errorMiddleware")
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 4400

// middlewares
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    credentials: true
}));

// routes
app.use("/api/auth", userRoutes)
app.use("/api/idea", ideaRoutes)
app.use("/api/entity", entityRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/admin", adminRoutes)

// Error Handler
app.use(errorHandler)

// Connect database and start server
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => { app.listen(PORT, () => { console.log(`Server running on port ${PORT}`) }) })
    .catch((error) => console.log(error))