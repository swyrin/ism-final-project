import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mutations, queries, queryKeys } from "@www/api";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Props {
  shareId: string;
  sourceTitle: string;
  onClose: () => void;
}

function ImportDestinationPicker({ shareId, sourceTitle, onClose }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: home } = useQuery(queries.home());
  const documents = home?.documents ?? [];

  const [mode, setMode] = useState<"existing" | "new">(documents.length > 0 ? "existing" : "new");
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id ?? "");
  const [newTitle, setNewTitle] = useState<string>(sourceTitle);
  const [collisionError, setCollisionError] = useState<string | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);

  const importMutation = useMutation({
    ...mutations.share.import,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.home });
      navigate(`/file/${result.file.id}`);
    },
    onError: (err: Error) => {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("title")) {
        setCollisionError("You already have a document with this title.");
      } else {
        setGenericError(msg || "Import failed.");
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCollisionError(null);
    setGenericError(null);

    if (mode === "existing") {
      if (!selectedDocId) {
        setGenericError("Pick a document.");
        return;
      }
      importMutation.mutate({ id: shareId, body: { document_id: selectedDocId } });
    } else {
      if (!newTitle.trim()) {
        setCollisionError("Title is required.");
        return;
      }
      importMutation.mutate({ id: shareId, body: { new_document_title: newTitle.trim() } });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Add to my account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="dest"
                value="existing"
                checked={mode === "existing"}
                onChange={() => setMode("existing")}
                disabled={documents.length === 0}
              />
              Existing document
            </label>
            {mode === "existing" && (
              <select
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            )}
            {documents.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">You don't have any documents yet.</p>
            )}
          </fieldset>

          <fieldset>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="dest"
                value="new"
                checked={mode === "new"}
                onChange={() => setMode("new")}
              />
              New document
            </label>
            {mode === "new" && (
              <input
                type="text"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setCollisionError(null);
                }}
              />
            )}
            {collisionError && mode === "new" && (
              <p className="mt-1 text-xs text-red-600">{collisionError}</p>
            )}
          </fieldset>

          {genericError && <p className="text-sm text-red-600">{genericError}</p>}

          <button
            type="submit"
            disabled={importMutation.isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {importMutation.isPending ? "Importing…" : "Add to my account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ImportDestinationPicker;
