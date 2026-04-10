import type { NextFunction, Request, Response } from "express";

import { auth } from "@srv/lib/auth";
import { UnauthorizedError } from "@srv/utils/HttpError";
import { fromNodeHeaders } from "better-auth/node";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === "development") {
    req.user = { user_id: process.env.MOCK_USER_ID! };
    return next();
  }
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    throw new UnauthorizedError();
  }

  req.user = { user_id: session.user.id };
  next();
}
