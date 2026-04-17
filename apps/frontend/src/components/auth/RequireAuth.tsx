import type { ReactNode } from "react";

import { authClient } from "@www/lib/auth-client";
import { Navigate, useLocation } from "react-router-dom";

interface RequireAuthProps {
  children: ReactNode;
}

function RequireAuth({ children }: RequireAuthProps) {
  const { data: session, isPending } = authClient.useSession();
  const location = useLocation();

  if (isPending) {
    return <div className="flex min-h-screen items-center justify-center text-gray-500">Loading…</div>;
  }

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export default RequireAuth;
