import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaCog, FaSearch, FaUserCircle, FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DropdownMenu from '../dashboard/header/DropdownMenu';
import { API_URL } from '../../../constant';

const Header = ({ toggleDropdown, dropdownOpen }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

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
        }, 350);
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
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm bg-custom-blue bg-opacity-90 backdrop-blur-md transition-all duration-300"> 
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-16 py-4 sm:py-0">
                    {/* Top row for mobile: Back button and User actions */}
                    <div className="flex items-center justify-between w-full sm:hidden mb-4">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Dashboard
                        </button>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/notifications')}
                                className="p-2 text-gray-600 hover:text-blue-600 relative"
                            >
                                <FaBell className="text-xl" />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            
                            <button
                                onClick={() => navigate('/settings')}
                                className="p-2 text-gray-600 hover:text-blue-600"
                            >
                                <FaCog className="text-xl" />
                            </button>

                            <div className="relative">
                                <button
                                    onClick={toggleDropdown}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <FaUserCircle className="text-2xl text-gray-600 hover:text-blue-600" />
                                </button>
                                
                                {dropdownOpen && <DropdownMenu />}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between w-full">
                        {/* Left: Back to Dashboard button */}
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <FaArrowLeft className="mr-2" />
                                Back to Dashboard
                            </button>
                        </div>

                        {/* Center: Search bar with dropdown */}
                        <div className="flex-1 max-w-2xl mx-8 relative" ref={dropdownRef}>
                            <form onSubmit={handleSearch} className="relative">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setShowDropdown(true)}
                                        placeholder="Search documents..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                                                    navigate(`/page-layout/${result.id}`);
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                <FaFileAlt className="text-blue-500 mr-3" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-800 truncate">{result.title || 'Untitled'}</div>
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
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/notifications')}
                                className="p-2 text-gray-600 hover:text-blue-600 relative"
                            >
                                <FaBell className="text-xl" />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            
                            <button
                                onClick={() => navigate('/settings')}
                                className="p-2 text-gray-600 hover:text-blue-600"
                            >
                                <FaCog className="text-xl" />
                            </button>

                            <div className="relative">
                                <button
                                    onClick={toggleDropdown}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <FaUserCircle className="text-2xl text-gray-600 hover:text-blue-600" />
                                </button>
                                
                                {dropdownOpen && <DropdownMenu />}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="w-full sm:hidden">
                        <form onSubmit={handleSearch} className="w-full">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowDropdown(true)}
                                    placeholder="Search documents..."
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </form>
                        {/* Mobile Dropdown results */}
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
                                                navigate(`/page-layout/${result.id}`);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <FaFileAlt className="text-blue-500 mr-3" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-800 truncate">{result.title || 'Untitled'}</div>
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
                </div>
            </div>
        </header>
    );
};

export default Header;