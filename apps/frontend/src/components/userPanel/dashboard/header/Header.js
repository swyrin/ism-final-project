import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaUserCircle, FaBell, FaCog, FaFileAlt } from 'react-icons/fa';
import DropdownMenu from './DropdownMenu';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../../constant';

const Header = ({ toggleDropdown, dropdownOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : [data]);
        setShowDropdown(true);
      } catch (error) {
        setSearchResults([]);
        setShowDropdown(true);
      }
      setLoading(false);
    }, 350); // debounce
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 bg-custom-blue shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 md:h-16">
          {/* Left: Logo and Dashboard title */}
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className="text-lg md:text-xl font-bold text-gray-800">KiMS Dashboard</h1>
          </div>

          {/* Center: Search bar */}
          <div className="w-full md:flex-1 md:max-w-2xl md:mx-8 relative" ref={dropdownRef}>
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents, people, or topics..."
                  className="w-full pl-10 pr-4 py-2 text-sm md:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onFocus={() => searchQuery && setShowDropdown(true)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={handleSearch} />
              </div>
            </form>
            {/* Dropdown results */}
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer transition"
                      onClick={() => {
                        navigate(`/file/${result.id}`);
                        setShowDropdown(false);
                      }}
                    >
                      <FaFileAlt className="text-blue-500 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate text-sm md:text-base">{result.title || 'Untitled'}</div>
                        <div className="text-xs text-gray-500 truncate">{result.description || 'No description'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Right: User actions */}
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 text-gray-600 hover:text-blue-600 relative"
            >
              <FaBell className="text-lg md:text-xl" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <FaCog className="text-lg md:text-xl" />
            </button>

            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <FaUserCircle className="text-xl md:text-2xl text-gray-600 hover:text-blue-600" />
              </button>
              
              {dropdownOpen && <DropdownMenu />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;