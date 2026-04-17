import { friendlyAuthError } from "@www/components/auth/errors";
import { authClient } from "@www/lib/auth-client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ChangeNameSection() {
  const { data: session } = authClient.useSession();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user.name) setName(session.user.name);
  }, [session?.user.name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      const { error } = await authClient.updateUser({ name: name.trim() });
      if (error) {
        setStatus({ kind: "err", msg: friendlyAuthError(error) });
      } else {
        setStatus({ kind: "ok", msg: "Saved." });
      }
    } catch (err) {
      setStatus({ kind: "err", msg: friendlyAuthError(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Display name</h2>
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {status && (
        <p className={`text-sm ${status.kind === "ok" ? "text-green-600" : "text-red-600"}`}>{status.msg}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ★ YOUR TURN: implement client-side validation before the network call.
  //
  // Why this matters: Better Auth will reject mismatched / weak passwords from the server,
  // but we want to fail fast in the browser to give the user instant feedback and skip a
  // round-trip. This is also the layer where you decide what counts as "valid input" before
  // it even reaches the API — that's a UX policy choice, not a Better Auth one.
  //
  // Return null if the input is OK; return a user-facing error string otherwise.
  // Suggested rules to consider (pick the ones that match your UX taste):
  //   - newPassword !== confirmPassword
  //   - newPassword.length < 8
  //   - newPassword === currentPassword (would be a no-op)
  function validate(): string | null {
    // TODO (you): write 3-6 lines here, returning either null or an error string.
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const validationError = validate();
    if (validationError) {
      setStatus({ kind: "err", msg: validationError });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (error) {
        setStatus({ kind: "err", msg: friendlyAuthError(error) });
      } else {
        setStatus({ kind: "ok", msg: "Password changed." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setStatus({ kind: "err", msg: friendlyAuthError(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Change password</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">Current password</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">New password</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      {status && (
        <p className={`text-sm ${status.kind === "ok" ? "text-green-600" : "text-red-600"}`}>{status.msg}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}

function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
          <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">
            ← Back
          </button>
        </div>
        <div className="space-y-6">
          <ChangeNameSection />
          <ChangePasswordSection />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
