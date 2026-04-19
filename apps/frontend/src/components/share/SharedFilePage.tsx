import { useQuery } from "@tanstack/react-query";
import { queries } from "@www/api";
import { API_URL } from "@www/constant";
import { authClient } from "@www/lib/auth-client";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import ImportDestinationPicker from "./ImportDestinationPicker";

function SharedFilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = authClient.useSession();
  const { data: info, isLoading, error } = useQuery(queries.shareInfo(id ?? ""));
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!id) return <div className="p-8">Invalid share link.</div>;
  if (isLoading) return <div className="p-8 text-gray-500">Loading…</div>;
  if (error || !info) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">Share not found</h1>
        <p className="text-gray-500">The link may be invalid.</p>
      </div>
    );
  }
  if (!info.isActive) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">This share has been revoked</h1>
        <p className="text-gray-500">The owner is no longer sharing this file.</p>
      </div>
    );
  }

  const currentUserId = session?.user?.id ?? null;
  const isOwner = currentUserId !== null && currentUserId === info.owner.id;
  const loggedIn = currentUserId !== null;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">{info.file.title}</h1>
          <p className="text-sm text-gray-500">
            Shared by {info.owner.name} · {info.file.category_name}
          </p>
        </div>
        <div>
          {!loggedIn && (
            <Link
              to="/auth"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign in to save a copy
            </Link>
          )}
          {loggedIn && !isOwner && (
            <button
              onClick={() => setPickerOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add to my account
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 bg-gray-100">
        <iframe title="Shared file" src={`${API_URL}/share/${id}`} className="h-full w-full border-0" />
      </main>

      {pickerOpen && (
        <ImportDestinationPicker
          shareId={id}
          sourceTitle={info.file.title}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

export default SharedFilePage;
