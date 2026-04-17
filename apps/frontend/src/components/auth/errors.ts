const FRIENDLY_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email or password is incorrect.",
  USER_ALREADY_EXISTS: "An account with that email already exists.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  INVALID_PASSWORD: "Current password is incorrect.",
};

export function friendlyAuthError(err: unknown): string {
  if (err && typeof err === "object" && "code" in err && typeof err.code === "string") {
    return FRIENDLY_MESSAGES[err.code] ?? "Something went wrong, please try again.";
  }
  if (err instanceof Error) {
    return err.message || "Something went wrong, please try again.";
  }
  return "Something went wrong, please try again.";
}
