"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenException = exports.BadRequestException = exports.UnauthorizedException = exports.InternalServerException = exports.NotFoundException = void 0;
const iHyperflow_1 = require("../iHyperflow");
class NotFoundException extends iHyperflow_1.ResponseException {
    constructor(errors) {
        super();
        this.errors = errors;
        this.statusCode = 404;
        Object.setPrototypeOf(this, NotFoundException.prototype);
    }
    formatErrors() {
        return this.errors.map((err) => {
            return { message: err };
        });
    }
}
exports.NotFoundException = NotFoundException;
class InternalServerException extends iHyperflow_1.ResponseException {
    constructor(error) {
        super();
        this.error = error;
        this.statusCode = 500;
        if (!error) {
            this.error = "Internal Server Error";
        }
        Object.setPrototypeOf(this, NotFoundException.prototype);
    }
    formatErrors() {
        return { message: this.error };
    }
}
exports.InternalServerException = InternalServerException;
class UnauthorizedException extends iHyperflow_1.ResponseException {
    constructor(error) {
        super();
        this.error = error;
        this.statusCode = 401;
        if (!error) {
            this.error = "Unauthorized";
        }
        Object.setPrototypeOf(this, NotFoundException.prototype);
    }
    formatErrors() {
        return { message: this.error };
    }
}
exports.UnauthorizedException = UnauthorizedException;
class BadRequestException extends iHyperflow_1.ResponseException {
    constructor(error) {
        super();
        this.error = error;
        this.statusCode = 400;
        if (!error) {
            this.error = "Bad Request";
        }
        Object.setPrototypeOf(this, NotFoundException.prototype);
    }
    formatErrors() {
        return { message: this.error };
    }
}
exports.BadRequestException = BadRequestException;
class ForbiddenException extends iHyperflow_1.ResponseException {
    constructor(error) {
        super();
        this.error = error;
        this.statusCode = 403;
        if (!error) {
            this.error = "Forbidden";
        }
        Object.setPrototypeOf(this, NotFoundException.prototype);
    }
    formatErrors() {
        return { message: this.error };
    }
}
exports.ForbiddenException = ForbiddenException;
//# sourceMappingURL=response-exception.handler.js.map