class CustomError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.isOperational = true;
        this.message = message;
    }
}

module.exports = CustomError;
