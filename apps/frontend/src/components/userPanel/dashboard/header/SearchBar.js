import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { API_URL } from '../../../../constant';

const SearchBar = ({ setSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      // If your API returns a single object, wrap it in an array for consistency
      setSearchResults(Array.isArray(data) ? data : [data]);
    } catch (error) {
      alert('Error searching: ' + error.message);
      setSearchResults([]);
    }
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
};

export default SearchBar;