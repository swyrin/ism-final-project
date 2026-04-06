import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@www/api';

interface SearchResult {
  id: string;
  title: string;
  documentTitle?: string;
}

interface ModalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (file: SearchResult) => void;
}

function ModalSearch({ isOpen, onClose, onSelect }: ModalSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');

  const { data: results = [], isFetching: loading } = useQuery({
    ...queries.search(submittedKeyword),
  });

  const handleSearch = () => {
    if (!keyword) return;
    setSubmittedKeyword(keyword);
  };

  const handleSelect = (file: SearchResult) => {
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
                  {(file as SearchResult).documentTitle
                    ? `${(file as SearchResult).documentTitle} > ${file.title}`
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
}

export default ModalSearch;
