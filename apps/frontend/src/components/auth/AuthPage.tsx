import SignInForm from "@www/components/auth/SignInForm";
import SignUpForm from "@www/components/auth/SignUpForm";
import { authClient } from "@www/lib/auth-client";
import { useState } from "react";
import { Navigate } from "react-router-dom";

type Tab = "signin" | "signup";

function AuthPage() {
  const [tab, setTab] = useState<Tab>("signin");
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="flex min-h-screen items-center justify-center text-gray-500">Loading…</div>;
  }
  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">KiMS</h1>

        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              tab === "signin" ? "bg-white text-gray-900 shadow" : "text-gray-600"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              tab === "signup" ? "bg-white text-gray-900 shadow" : "text-gray-600"
            }`}
          >
            Sign up
          </button>
        </div>

        {tab === "signin" ? <SignInForm /> : <SignUpForm />}
      </div>
    </div>
  );
}

export default AuthPage;
