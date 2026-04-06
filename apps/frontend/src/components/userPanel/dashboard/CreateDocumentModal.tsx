import { useState, useEffect } from "react";

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

function CreateDocumentModal({ isOpen, onClose, onCreate }: CreateDocumentModalProps) {
  const [docName, setDocName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDocName("");
      setError("");
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (!docName.trim()) {
      setError("Site name is required");
      return;
    }
    onCreate(docName.trim());
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm transition-all">
      <div className="animate-fadeIn w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Create New Site</h2>
        <p className="mb-6 text-gray-500">
          Give your site a clear, descriptive name to make it easy to find later.
        </p>
        <input
          type="text"
          placeholder="Enter site name"
          value={docName}
          onChange={(e) => {
            setDocName(e.target.value);
            setError("");
          }}
          className={`w-full border p-3 ${error ? "border-red-500" : "border-gray-300"} mb-2 rounded-lg text-gray-800 transition focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          autoFocus={true}
          maxLength={100}
        />
        {error && <div className="mb-2 text-sm text-red-500">{error}</div>}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateDocumentModal;
