import { createAuthClient } from "better-auth/react";

type AuthClient = ReturnType<typeof createAuthClient>;

const authBaseUrl =
  // Do chạy local trong container nên FE sẽ gọi BE qua network,  dùng window.location.origin được
  (import.meta.env.VITE_BETTER_AUTH_URL as string | undefined) ?? window.location.origin;

export const authClient: AuthClient = createAuthClient({
  baseURL: authBaseUrl,
});
