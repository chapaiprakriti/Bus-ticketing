export class HttpException extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.name = "HttpException";

    Object.setPrototypeOf(this, HttpException.prototype);
  }
}