import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { API_URL } from '../../../../constant';
import useClickOutside from '../../../../hooks/useClickOutside';

const DocMenu = ({ docId, docTitle, menuPosition, isMenuVisible, onEditSuccess, onDeleteSuccess }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [infoData, setInfoData] = useState(null);
  const [menuStyle, setMenuStyle] = useState({});
  const menuRef = useClickOutside(() => {
    setShowInfo(false);
    setInfoData(null);
  });

  useEffect(() => {
    if (menuPosition && isMenuVisible) {
      const menuWidth = 192; // Width of the menu (w-48 = 12rem = 192px)
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Calculate if menu would overflow right
      const wouldOverflowRight = menuPosition.left + menuWidth > windowWidth;
      
      // Calculate if menu would overflow bottom
      const menuHeight = 120; // Approximate height of menu
      const wouldOverflowBottom = menuPosition.top + menuHeight > windowHeight + window.scrollY;
      
      setMenuStyle({
        position: 'fixed',
        top: wouldOverflowBottom 
          ? `${menuPosition.top - menuHeight}px` 
          : `${menuPosition.top}px`,
        left: wouldOverflowRight 
          ? `${menuPosition.left - menuWidth}px` 
          : `${menuPosition.left}px`,
        zIndex: 50
      });
    }
  }, [menuPosition, isMenuVisible]);

  // Edit document name
  const handleEditName = async () => {
    const newName = prompt('Enter new document name:', docTitle);
    if (newName && newName !== docTitle) {
      const formData = new URLSearchParams();
      formData.append('id', docId);
      formData.append('title', newName);
      const response = await fetch(`${API_URL}/document`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      if (response.ok) {
        const updatedDoc = await response.json();
        onEditSuccess(updatedDoc.id, updatedDoc.title);
      } else {
        alert('Failed to update document name');
      }
    }
  };

  // Delete document
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    const formData = new URLSearchParams();
    formData.append('id', docId);
    const response = await fetch(`${API_URL}/document`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    if (response.ok) {
      onDeleteSuccess();
    } else {
      alert('Failed to delete document');
    }
  };

  // Show info modal
  const toggleInfo = async () => {
    if (!showInfo) {
      try {
        const response = await fetch(`${API_URL}/document?id=${docId}`);
        if (!response.ok) throw new Error('Failed to fetch document info');
        const data = await response.json();
        setInfoData(data);
      } catch (error) {
        setInfoData(null);
        alert('Error fetching document info: ' + error.message);
      }
    }
    setShowInfo((prev) => !prev);
  };

  if (!isMenuVisible) return null;

  const menuItems = [
    { icon: <FaEdit className="w-4 h-4" />, text: "Edit Name", onClick: handleEditName },
    { icon: <FaTrash className="w-4 h-4" />, text: "Delete Document", onClick: handleDelete, isDanger: true },
    { icon: <FaInfoCircle className="w-4 h-4" />, text: "Info", onClick: toggleInfo }
  ];

  return (
    <>
      <div
        ref={menuRef}
        className="w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
        style={menuStyle}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
              item.isDanger 
                ? 'text-red-600 hover:bg-red-50' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="flex-1">{item.text}</span>
          </button>
        ))}
      </div>

      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-semibold text-gray-800">Document Information</h4>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {infoData ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-medium text-gray-600">Title:</span>
                    <span className="text-gray-800">{infoData.title}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-medium text-gray-600">Modified at:</span>
                    <span className="text-gray-800">{new Date(infoData.modified_at).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="font-medium text-gray-600">History:</span>
                    <span className="text-gray-800">
                      {infoData.history && infoData.history.length
                        ? infoData.history.map((h, i) => (
                            <div key={i}>{new Date(h).toLocaleString()}</div>
                          ))
                        : 'No history'}
                    </span>
                  </div>
                </>
              ) : (
                <div>Loading...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocMenu;
