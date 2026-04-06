import { useQuery } from "@tanstack/react-query";
import { queries } from "@www/api";
import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  setSearchResults: (results: unknown[]) => void;
}

function SearchBar({ setSearchResults }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { data = [] } = useQuery({
    ...queries.search(submittedQuery),
  });

  useEffect(() => {
    setSearchResults(data);
  }, [data, setSearchResults]);

  const handleSearch = () => {
    if (!searchQuery) {
      return;
    }
    setSubmittedQuery(searchQuery);
  };

  return (
    <div className="flex w-full items-center rounded-lg bg-gray-100 p-2">
      <FaSearch className="mr-2 text-gray-400" />
      <input
        type="text"
        placeholder="Search for documents..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border-none bg-transparent text-gray-700 focus:outline-none"
      />
      <button onClick={handleSearch} className="ml-2 rounded bg-blue-600 px-3 py-1 text-white">
        Search
      </button>
    </div>
  );
}

export default SearchBar;
