import { useMutation, useQuery } from "@tanstack/react-query";
import { mutations, queries } from "@www/api";
import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface EditableFile {
  id: string;
  title?: string;
  description?: string;
  category_id?: string | number;
}

interface Props {
  file: EditableFile | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function EditFileModal({ file, isOpen, onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { data: categories = [] } = useQuery(queries.categories());

  useEffect(() => {
    if (file) {
      setName(file.title ?? "");
      setDescription(file.description ?? "");
      setCategoryId(String(file.category_id ?? ""));
    }
  }, [file]);

  const updateMutation = useMutation({
    ...mutations.file.update,
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });

  if (!isOpen || !file) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("title", name.trim());
    params.set("description", description.trim());
    if (categoryId) params.set("category_id", categoryId);
    updateMutation.mutate({ id: file!.id, params });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Edit file</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">— No category —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {updateMutation.isError && (
            <p className="text-sm text-red-600">{(updateMutation.error as Error).message}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !name.trim()}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditFileModal;
