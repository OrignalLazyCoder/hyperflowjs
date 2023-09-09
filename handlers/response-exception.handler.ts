import { ResponseException } from "../iHyperflow";

export class NotFoundException extends ResponseException {
  statusCode = 404;
  constructor(public errors: string[]) {
    super();
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
  formatErrors() {
    return this.errors.map((err) => {
      return { message: err };
    });
  }
}

export class InternalServerException extends ResponseException {
  statusCode = 500;
  constructor(public error?: string) {
    super();
    if (!error) {
      this.error = "Internal Server Error";
    }
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
  formatErrors() {
    return { message: this.error };
  }
}

export class UnauthorizedException extends ResponseException {
  statusCode = 401;
  constructor(public error?: string) {
    super();
    if (!error) {
      this.error = "Unauthorized";
    }
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
  formatErrors() {
    return { message: this.error };
  }
}

export class BadRequestException extends ResponseException {
  statusCode = 400;
  constructor(public error?: string) {
    super();
    if (!error) {
      this.error = "Bad Request";
    }
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
  formatErrors() {
    return { message: this.error };
  }
}

export class ForbiddenException extends ResponseException {
  statusCode = 403;
  constructor(public error?: string) {
    super();
    if (!error) {
      this.error = "Forbidden";
    }
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
  formatErrors() {
    return { message: this.error };
  }
}
