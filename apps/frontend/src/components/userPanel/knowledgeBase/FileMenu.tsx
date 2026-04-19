import type { CSSProperties, RefObject } from "react";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaDownload, FaInfoCircle, FaTag } from "react-icons/fa";

import useClickOutside from "../../../hooks/useClickOutside";

interface MenuPosition {
  top: number;
  left: number;
}

interface FileMenuProps {
  docId: string;
  isMenuVisible: boolean;
  menuPosition: MenuPosition | null;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onEditDescription: () => void;
  onEditCategory: () => void;
  onInfo: () => void;
  onClose: () => void;
}

function FileMenu({
  isMenuVisible,
  menuPosition,
  onEdit,
  onDelete,
  onDownload,
  onEditDescription,
  onEditCategory,
  onInfo,
  onClose,
}: FileMenuProps) {
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const menuRef = useClickOutside(() => {
    if (onClose) {
      onClose();
    }
  });

  useEffect(() => {
    if (menuPosition && isMenuVisible) {
      setMenuStyle({
        position: "absolute",
        top: `${menuPosition.top + 24}px`,
        right: "0px",
        zIndex: 50,
      });
    }
  }, [menuPosition, isMenuVisible]);

  if (!isMenuVisible) {
    return null;
  }

  const menuItems = [
    { icon: <FaEdit className="h-4 w-4" />, text: "Edit Name", onClick: onEdit },
    { icon: <FaEdit className="h-4 w-4" />, text: "Edit Description", onClick: onEditDescription },
    { icon: <FaTag className="h-4 w-4" />, text: "Change Category", onClick: onEditCategory },
    { icon: <FaDownload className="h-4 w-4" />, text: "Download", onClick: onDownload },
    { icon: <FaInfoCircle className="h-4 w-4" />, text: "Info", onClick: onInfo },
    { icon: <FaTrash className="h-4 w-4" />, text: "Delete", onClick: onDelete, isDanger: true },
  ];

  return (
    <div
      ref={menuRef as RefObject<HTMLDivElement>}
      className="w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
      style={menuStyle}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          title={item.text}
          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
            item.isDanger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {item.icon}
          {item.text}
        </button>
      ))}
    </div>
  );
}

export default FileMenu;
