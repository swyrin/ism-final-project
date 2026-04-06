import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@www/api';

interface SearchBarProps {
  setSearchResults: (results: unknown[]) => void;
}

function SearchBar({ setSearchResults }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const { data = [] } = useQuery({
    ...queries.search(submittedQuery),
  });

  useEffect(() => {
    setSearchResults(data);
  }, [data, setSearchResults]);

  const handleSearch = () => {
    if (!searchQuery) return;
    setSubmittedQuery(searchQuery);
  };

  return (
    <div className="w-full flex items-center bg-gray-100 p-2 rounded-lg">
      <FaSearch className="text-gray-400 mr-2" />
      <input
        type="text"
        placeholder="Search for documents..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-transparent border-none focus:outline-none text-gray-700"
      />
      <button
        onClick={handleSearch}
        className="ml-2 bg-blue-600 text-white px-3 py-1 rounded"
      >
        Search
      </button>
    </div>
  );
}

export default SearchBar;
