import React from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DropdownMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
      {/* User Info */}
      <div className="px-4 py-2 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-800">John Doe</p>
        <p className="text-xs text-gray-500">john.doe@example.com</p>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <FaUser className="mr-3 text-gray-400" />
          Profile
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <FaCog className="mr-3 text-gray-400" />
          Settings
        </button>

        <button
          onClick={() => navigate('/help')}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <FaQuestionCircle className="mr-3 text-gray-400" />
          Help & Support
        </button>

        <div className="border-t border-gray-100 my-1"></div>

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          <FaSignOutAlt className="mr-3" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default DropdownMenu;