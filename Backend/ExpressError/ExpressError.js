class ExpressError extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode; // Use 'status' to match the error handling middleware
        this.message = message;
    }
}

module.exports = ExpressError;
