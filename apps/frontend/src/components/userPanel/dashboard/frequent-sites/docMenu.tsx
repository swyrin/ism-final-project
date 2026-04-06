import type { CSSProperties, RefObject } from "react";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api, queries } from "@www/api";
import useClickOutside from "@www/hooks/useClickOutside";
import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";

interface MenuPosition {
  top: number;
  left: number;
}

interface DocMenuProps {
  docId: string;
  docTitle: string;
  menuPosition: MenuPosition;
  isMenuVisible: boolean;
  onEditSuccess: (id: string, newTitle: string) => void;
  onDeleteSuccess: () => void;
}

function DocMenu({
  docId,
  docTitle,
  menuPosition,
  isMenuVisible,
  onEditSuccess,
  onDeleteSuccess,
}: DocMenuProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const menuRef = useClickOutside(() => {
    setShowInfo(false);
  });

  const { data: infoData } = useQuery({
    ...queries.document(docId),
    enabled: showInfo,
  });

  useEffect(() => {
    if (menuPosition && isMenuVisible) {
      const menuWidth = 192;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const wouldOverflowRight = menuPosition.left + menuWidth > windowWidth;
      const menuHeight = 120;
      const wouldOverflowBottom = menuPosition.top + menuHeight > windowHeight + window.scrollY;

      setMenuStyle({
        position: "fixed",
        top: wouldOverflowBottom ? `${menuPosition.top - menuHeight}px` : `${menuPosition.top}px`,
        left: wouldOverflowRight ? `${menuPosition.left - menuWidth}px` : `${menuPosition.left}px`,
        zIndex: 50,
      });
    }
  }, [menuPosition, isMenuVisible]);

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => api.document.rename(id, title),
    onSuccess: (doc) => onEditSuccess(doc.id, doc.title),
    onError: () => alert("Failed to update document name"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.document.delete(id),
    onSuccess: onDeleteSuccess,
    onError: () => alert("Failed to delete document"),
  });

  const handleEditName = () => {
    const newName = prompt("Enter new document name:", docTitle);
    if (newName && newName !== docTitle) {
      renameMutation.mutate({ id: docId, title: newName });
    }
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }
    deleteMutation.mutate(docId);
  };

  const toggleInfo = () => {
    setShowInfo((prev) => !prev);
  };

  if (!isMenuVisible) {
    return null;
  }

  const menuItems = [
    { icon: <FaEdit className="h-4 w-4" />, text: "Edit Name", onClick: handleEditName },
    { icon: <FaTrash className="h-4 w-4" />, text: "Delete Document", onClick: handleDelete, isDanger: true },
    { icon: <FaInfoCircle className="h-4 w-4" />, text: "Info", onClick: toggleInfo },
  ];

  return (
    <>
      <div
        ref={menuRef as RefObject<HTMLDivElement>}
        className="w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        style={menuStyle}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm ${
              item.isDanger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="flex-1">{item.text}</span>
          </button>
        ))}
      </div>

      {showInfo && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-xl font-semibold text-gray-800">Document Information</h4>
              <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {infoData ? (
                <>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="font-medium text-gray-600">Title:</span>
                    <span className="text-gray-800">{infoData.title}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="font-medium text-gray-600">Modified at:</span>
                    <span className="text-gray-800">{new Date(infoData.modified_at).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="font-medium text-gray-600">History:</span>
                    <span className="text-gray-800">
                      {infoData.history && infoData.history.length
                        ? infoData.history.map((h, i) => <div key={i}>{new Date(h).toLocaleString()}</div>)
                        : "No history"}
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
}

export default DocMenu;
