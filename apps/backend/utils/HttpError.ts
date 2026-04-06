export class HttpError extends Error {
  constructor(
    public status: number,
    public error: string,
  ) {
    super(error);
    this.name = "HttpError";
  }
}
