export class ErrorWithCause extends Error {
  cause: string;

  constructor(message: string, cause: string) {
    super(message);
    this.cause = cause;
  }
}
