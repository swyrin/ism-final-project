import { FaUser, FaCog, FaSignOutAlt, FaQuestionCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function DropdownMenu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
      <div className="border-b border-gray-100 px-4 py-2">
        <p className="text-sm font-medium text-gray-800">John Doe</p>
        <p className="text-xs text-gray-500">john.doe@example.com</p>
      </div>

      <div className="py-1">
        <button
          onClick={() => navigate("/profile")}
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <FaUser className="mr-3 text-gray-400" />
          Profile
        </button>

        <button
          onClick={() => navigate("/settings")}
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <FaCog className="mr-3 text-gray-400" />
          Settings
        </button>

        <button
          onClick={() => navigate("/help")}
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <FaQuestionCircle className="mr-3 text-gray-400" />
          Help & Support
        </button>

        <div className="my-1 border-t border-gray-100" />

        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          <FaSignOutAlt className="mr-3" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default DropdownMenu;
