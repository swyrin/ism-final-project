import express from "express";

export class HttpError extends Error {
  constructor(
    public status: number,
    public error: string,
  ) {
    super(error);
    this.name = "HttpError";
  }
}
export class BadRequestError extends HttpError {
  constructor(message = "Bad request") {
    super(400, message);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}
export function handleError(err: unknown, res: express.Response) {
  if (err instanceof HttpError) {
    console.error("[HttpError]", {
      message: err.error,
      status: err.status,
      stack: err.stack,
    });

    res.status(err.status).json({ error: err.error });
  } else {
    console.error("[UnknownError]", err);

    res.status(500).json({ error: "internal error." });
  }
}
