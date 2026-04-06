interface ModalProps {
  closeModal: () => void;
  siteName: string;
  setSiteName: (name: string) => void;
  handleAddSite: () => void;
}

function Modal({ closeModal, siteName, setSiteName, handleAddSite }: ModalProps) {
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-500">
      <div className="w-1/3 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Create New Site</h2>
        <input
          type="text"
          placeholder="Enter site name"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 p-2"
        />
        <div className="flex justify-between">
          <button onClick={closeModal} className="rounded bg-gray-500 px-4 py-2 text-white">
            Cancel
          </button>
          <button onClick={handleAddSite} className="rounded bg-blue-500 px-4 py-2 text-white">
            Add Site
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
