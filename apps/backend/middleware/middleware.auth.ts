import type { NextFunction, Request, Response } from "express";

import { auth } from "@srv/lib/auth";
import { UnauthorizedError } from "@srv/utils/HttpError";
import { fromNodeHeaders } from "better-auth/node";
function isInternalIP(req: Request): boolean {
  const forwarded = req.headers["x-forwarded-for"];

  let ip: string | undefined;

  if (typeof forwarded === "string") {
    // format: "clientIP, proxy1, proxy2"
    ip = forwarded.split(",")[0].trim();
  } else {
    ip = req.socket.remoteAddress;
  }

  if (!ip) return false;

  return ip.startsWith("10.8.0.");
}
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session && isInternalIP(req)) {
    req.user = { user_id: process.env.INTERNAL_USER_ID ?? "0" }; // system/internal user
    return next();
  }

  if (!session) {
    throw new UnauthorizedError();
  }

  req.user = { user_id: session.user.id };
  next();
}
