import type { CSSProperties, RefObject } from "react";

import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaDownload, FaInfoCircle, FaShareAlt, FaExternalLinkAlt } from "react-icons/fa";

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
  onInfo: () => void;
  onViewSharedUrls: () => void;
  onViewInNewTab: () => void;
  onClose: () => void;
}

function FileMenu({
  isMenuVisible,
  menuPosition,
  onEdit,
  onDelete,
  onDownload,
  onInfo,
  onViewSharedUrls,
  onViewInNewTab,
  onClose,
}: FileMenuProps) {
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const menuRef = useClickOutside(() => {
    if (onClose) onClose();
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

  if (!isMenuVisible) return null;

  const itemCls =
    "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100";

  const menuItems = [
    { icon: <FaEdit className="h-4 w-4" />, text: "Edit", onClick: onEdit },
    { icon: <FaDownload className="h-4 w-4" />, text: "Download", onClick: onDownload },
    { icon: <FaInfoCircle className="h-4 w-4" />, text: "Info", onClick: onInfo },
    { icon: <FaShareAlt className="h-4 w-4" />, text: "View Shared URLs", onClick: onViewSharedUrls },
    { icon: <FaExternalLinkAlt className="h-4 w-4" />, text: "View in New Tab", onClick: onViewInNewTab },
  ];

  return (
    <div
      ref={menuRef as RefObject<HTMLDivElement>}
      className="w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
      style={menuStyle}
    >
      {menuItems.map((item) => (
        <button key={item.text} onClick={item.onClick} className={itemCls}>
          {item.icon}
          {item.text}
        </button>
      ))}

      <button
        onClick={onDelete}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
      >
        <FaTrash className="h-4 w-4" />
        Delete
      </button>
    </div>
  );
}

export default FileMenu;
