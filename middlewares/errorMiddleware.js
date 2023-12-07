// Error Handler
const errorHandler = (err, req, res, next) => {

    // getting status code from res if there is none then using 500.
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode)

    // Error message and stack(origin of error)
    res.json({
        message: err.message,
        // Showing stack only in development environment.
        stack: process.env.NODE_ENV === "development" ? err.stack : null
    })
}

module.exports = errorHandler;