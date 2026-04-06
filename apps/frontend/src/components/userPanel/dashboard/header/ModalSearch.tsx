import { useQuery } from "@tanstack/react-query";
import { queries } from "@www/api";
import { useState } from "react";

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
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");

  const { data: results = [], isFetching: loading } = useQuery({
    ...queries.search(submittedKeyword),
  });

  const handleSearch = () => {
    if (!keyword) {
      return;
    }
    setSubmittedKeyword(keyword);
  };

  const handleSelect = (file: SearchResult) => {
    onSelect && onSelect(file);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="bg-opacity-30 fixed inset-0 z-50 flex items-start justify-center bg-black">
      <div className="relative mt-24 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
          &times;
        </button>
        <div className="mb-4 flex">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search file name..."
            className="flex-1 rounded-l border border-gray-300 p-2"
          />
          <button onClick={handleSearch} className="rounded-r bg-blue-600 px-4 text-white">
            Search
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Searching...</div>
        ) : (
          <ul>
            {results.map((file) => (
              <li
                key={file.id}
                className="cursor-pointer rounded p-2 hover:bg-gray-100"
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
              <li className="text-center text-gray-400">No results found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ModalSearch;
