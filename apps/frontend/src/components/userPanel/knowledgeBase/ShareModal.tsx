import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mutations, queries, queryKeys, type Share } from "@www/api";
import { useState } from "react";
import { FaCopy, FaPlus, FaTimes, FaTrash } from "react-icons/fa";

interface ShareModalProps {
  fileId: string;
  isOpen: boolean;
  onClose: () => void;
}

function ShareModal({ fileId, isOpen, onClose }: ShareModalProps) {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: shares, isLoading } = useQuery(queries.shares(fileId));

  const createMutation = useMutation({
    ...mutations.file.createShare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shares(fileId) });
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const revokeMutation = useMutation({
    ...mutations.share.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shares(fileId) });
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  if (!isOpen) return null;

  function handleCopy(s: Share) {
    navigator.clipboard.writeText(s.shareUrl).then(() => {
      setCopiedId(s.id);
      setTimeout(() => setCopiedId((cur) => (cur === s.id ? null : cur)), 1500);
    });
  }

  function handleRevoke(s: Share) {
    if (window.confirm("Revoke this share link? Anyone using it will no longer be able to view the file.")) {
      revokeMutation.mutate(s.id);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Share file</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        {isLoading ? (
          <p className="py-4 text-sm text-gray-500">Loading…</p>
        ) : shares && shares.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {shares.map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <input
                  readOnly
                  value={s.shareUrl}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 truncate bg-transparent text-sm text-gray-700 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(s)}
                  className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  title="Copy link"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={() => handleRevoke(s)}
                  disabled={revokeMutation.isPending}
                  className="rounded p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                  title="Revoke"
                >
                  <FaTrash />
                </button>
                {copiedId === s.id && <span className="text-xs text-green-600">Copied!</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-gray-500">No active share links yet.</p>
        )}

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          onClick={() => createMutation.mutate(fileId)}
          disabled={createMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <FaPlus />
          {createMutation.isPending ? "Creating…" : "Create new share link"}
        </button>
      </div>
    </div>
  );
}

export default ShareModal;
