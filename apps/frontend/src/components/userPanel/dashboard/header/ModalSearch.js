import React, { useState } from 'react';
import { API_URL } from '../../../../constant';

const ModalSearch = ({ isOpen, onClose, onSelect }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!keyword) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(keyword)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      // If your API returns a single object, wrap it in an array
      setResults(Array.isArray(data) ? data : [data]);
    } catch (error) {
      setResults([]);
    }
    setLoading(false);
  };

  const handleSelect = (file) => {
    onSelect && onSelect(file);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-30">
      <div className="bg-white mt-24 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex mb-4">
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search file name..."
            className="flex-1 p-2 border border-gray-300 rounded-l"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 rounded-r"
          >
            Search
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Searching...</div>
        ) : (
          <ul>
            {results.map(file => (
              <li
                key={file.id}
                className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                onClick={() => handleSelect(file)}
              >
                <div className="font-semibold">{file.title}</div>
                <div className="text-xs text-gray-500">
                  {file.documentTitle
                    ? `${file.documentTitle} > ${file.title}`
                    : file.title}
                </div>
              </li>
            ))}
            {results.length === 0 && !loading && (
              <li className="text-gray-400 text-center">No results found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ModalSearch;