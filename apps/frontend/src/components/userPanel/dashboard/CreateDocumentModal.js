import React, { useState, useEffect } from 'react';

const CreateDocumentModal = ({ isOpen, onClose, onCreate }) => {
  const [docName, setDocName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDocName('');
      setError('');
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (!docName.trim()) {
      setError('Site name is required');
      return;
    }
    onCreate(docName.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Site</h2>
        <p className="text-gray-500 mb-6">Give your site a clear, descriptive name to make it easy to find later.</p>
        <input
          type="text"
          placeholder="Enter site name"
          value={docName}
          onChange={(e) => { setDocName(e.target.value); setError(''); }}
          className={`w-full p-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 mb-2 transition`}
          autoFocus
          maxLength={100}
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDocumentModal; 