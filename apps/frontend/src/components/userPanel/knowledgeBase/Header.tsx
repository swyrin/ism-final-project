import { useQuery } from "@tanstack/react-query";
import { queries } from "@www/api";
import { useState, useRef, useEffect } from "react";
import { FaSearch, FaUserCircle, FaArrowLeft, FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import DropdownMenu from "../dashboard/header/DropdownMenu";

interface HeaderProps {
  toggleDropdown: () => void;
  dropdownOpen: boolean;
}

function Header({ toggleDropdown, dropdownOpen }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchQuery) {
      setDebouncedQuery("");
      setShowDropdown(false);
      return;
    }
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setShowDropdown(true);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const { data: searchResults = [], isFetching: loading } = useQuery({
    ...queries.search(debouncedQuery),
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/search");
    }
    setShowDropdown(false);
  };

  return (
    <header className="bg-opacity-90 sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex h-auto flex-col items-start justify-between py-4 sm:h-16 sm:flex-row sm:items-center sm:py-0">
          <div className="mb-4 flex w-full items-center justify-between sm:hidden">
            <button
              onClick={() => navigate("/")}
              className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button onClick={toggleDropdown} className="flex items-center space-x-2 focus:outline-none">
                  <FaUserCircle className="text-2xl text-gray-600 hover:text-blue-600" />
                </button>
                {dropdownOpen && <DropdownMenu />}
              </div>
            </div>
          </div>

          <div className="hidden w-full items-center justify-between sm:flex">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            </div>

            <div className="relative mx-8 max-w-2xl flex-1" ref={dropdownRef}>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search documents..."
                    className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" />
                </div>
              </form>
              {showDropdown && (
                <div className="absolute right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex cursor-pointer items-center px-4 py-2 transition hover:bg-blue-50"
                        onClick={() => {
                          navigate(`/page-layout/${result.id}`);
                          setShowDropdown(false);
                        }}
                      >
                        <FaFileAlt className="mr-3 text-blue-500" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-gray-800">
                            {result.title || "Untitled"}
                          </div>
                          <div className="truncate text-xs text-gray-500">
                            {result.description || "No description"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">No results found</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button onClick={toggleDropdown} className="flex items-center space-x-2 focus:outline-none">
                  <FaUserCircle className="text-2xl text-gray-600 hover:text-blue-600" />
                </button>
                {dropdownOpen && <DropdownMenu />}
              </div>
            </div>
          </div>

          <div className="w-full sm:hidden">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search documents..."
                  className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" />
              </div>
            </form>
            {showDropdown && (
              <div className="absolute right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex cursor-pointer items-center px-4 py-2 transition hover:bg-blue-50"
                      onClick={() => {
                        navigate(`/page-layout/${result.id}`);
                        setShowDropdown(false);
                      }}
                    >
                      <FaFileAlt className="mr-3 text-blue-500" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-800">{result.title || "Untitled"}</div>
                        <div className="truncate text-xs text-gray-500">
                          {result.description || "No description"}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
