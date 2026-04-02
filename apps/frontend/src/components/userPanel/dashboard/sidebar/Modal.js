import React from 'react';

const Modal = ({ closeModal, siteName, setSiteName, handleAddSite }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Create New Site</h2>
        <input
          type="text"
          placeholder="Enter site name"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <div className="flex justify-between">
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSite}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Site
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;