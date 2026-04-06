import type { MouseEventHandler } from "react";

import { useQuery } from "@tanstack/react-query";
import { queries } from "@www/api";
import DropdownMenu from "@www/components/userPanel/dashboard/header/DropdownMenu";
import { useState, useRef, useEffect } from "react";
import { FaSearch, FaUserCircle, FaBell, FaCog, FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  toggleDropdown: () => void;
  dropdownOpen: boolean;
}

function Header({ toggleDropdown, dropdownOpen }: HeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-custom-blue bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between py-4 md:h-16 md:flex-row">
          <div className="mb-4 flex items-center md:mb-0">
            <h1 className="text-lg font-bold text-gray-800 md:text-xl">KiMS Dashboard</h1>
          </div>

          <div className="relative w-full md:mx-8 md:max-w-2xl md:flex-1" ref={dropdownRef}>
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents, people, or topics..."
                  className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none md:text-base"
                  onFocus={() => searchQuery && setShowDropdown(true)}
                />
                <FaSearch
                  className="absolute top-1/2 left-3 -translate-y-1/2 transform cursor-pointer text-gray-400"
                  onClick={handleSearch as unknown as MouseEventHandler}
                />
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
                        navigate(`/file/${result.id}`);
                        setShowDropdown(false);
                      }}
                    >
                      <FaFileAlt className="mr-3 shrink-0 text-blue-500" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-gray-800 md:text-base">
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

          <div className="mt-4 flex items-center space-x-4 md:mt-0">
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 text-gray-600 hover:text-blue-600"
            >
              <FaBell className="text-lg md:text-xl" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <button onClick={() => navigate("/settings")} className="p-2 text-gray-600 hover:text-blue-600">
              <FaCog className="text-lg md:text-xl" />
            </button>

            <div className="relative">
              <button onClick={toggleDropdown} className="flex items-center space-x-2 focus:outline-none">
                <FaUserCircle className="text-xl text-gray-600 hover:text-blue-600 md:text-2xl" />
              </button>

              {dropdownOpen && <DropdownMenu />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
