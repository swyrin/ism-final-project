import { useState, Dispatch, SetStateAction, MouseEvent, RefObject } from 'react';
import { FaStar, FaEllipsisV } from 'react-icons/fa';
import letterColors from '@www/data/colorData';
import { useNavigate } from 'react-router-dom';
import DocMenu from '@www/components/userPanel/dashboard/frequent-sites/docMenu';
import useClickOutside from '@www/hooks/useClickOutside';

interface Document {
  id: string;
  title: string;
  starred?: boolean;
  modified_at?: string;
  views?: string[];
}

interface MenuPosition {
  top: number;
  left: number;
}

interface FrequentSitesProps {
  documents?: Document[];
  setRecentDocuments: Dispatch<SetStateAction<Document[]>>;
  handleStar: (docId: string) => void;
  onCardClick?: (docId: string) => void;
}

function FrequentSites({
  documents = [],
  setRecentDocuments,
  handleStar,
  onCardClick
}: FrequentSitesProps) {
  const [docMenuVisible, setDocMenuVisible] = useState(false);
  const [docMenuPosition, setDocMenuPosition] = useState<MenuPosition>({ top: 0, left: 0 });
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const menuRef = useClickOutside(() => {
    setDocMenuVisible(false);
  });

  const getBorderColor = (initial: string) => {
    return letterColors[initial] || 'border-gray-500';
  };

  const navigate = useNavigate();
  const handleCardClick = (docId: string) => {
    if (onCardClick) {
      onCardClick(docId);
    } else {
      navigate(`/page-layout/${docId}`);
    }
  };

  const openDocMenu = (e: MouseEvent<HTMLButtonElement>, doc: Document) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 192;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const wouldOverflowRight = rect.left + menuWidth > windowWidth;
    const menuHeight = 120;
    const wouldOverflowBottom = rect.bottom + menuHeight > windowHeight;

    setDocMenuPosition({
      top: wouldOverflowBottom ? rect.top - menuHeight : rect.bottom,
      left: wouldOverflowRight ? rect.right - menuWidth : rect.left
    });
    setSelectedDoc(doc);
    setDocMenuVisible(true);
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="w-full lg:w-3/4">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Frequent Sites</h2>
        <p className="text-gray-500">No sites available</p>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-3/4">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Frequent Sites</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`p-4 md:p-6 rounded-lg shadow-md ${getBorderColor(doc.title?.[0])} border-l-4 hover:shadow-lg transition duration-300 ease-in-out`}
            onClick={() => handleCardClick(doc.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex justify-between items-start">
              <div
                className="font-semibold text-lg md:text-xl text-gray-800 truncate max-w-[140px] md:max-w-[180px]"
                title={doc.title || 'Untitled'}
              >
                {doc.title || 'Untitled'}
              </div>
              <div className="flex items-center gap-2">
                <FaStar
                  className={`cursor-pointer text-lg md:text-xl ${doc.starred ? 'text-yellow-400' : 'text-gray-400'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStar(doc.id);
                  }}
                />
                <button
                  onClick={(e) => openDocMenu(e, doc)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition hover:bg-gray-100"
                >
                  <FaEllipsisV className="text-lg md:text-xl" />
                </button>
              </div>
            </div>

            <div className="mt-2 space-y-2">
              <p className="text-sm md:text-base text-gray-600">
                Modified: {doc.modified_at ? new Date(doc.modified_at).toLocaleString() : 'No date'}
              </p>

              {(doc.views || []).map((view, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gray-300" />
                  <p className="text-gray-500 text-xs md:text-sm truncate">{view}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {docMenuVisible && selectedDoc && (
        <div ref={menuRef as RefObject<HTMLDivElement>}>
          <DocMenu
            docId={selectedDoc.id}
            docTitle={selectedDoc.title}
            menuPosition={docMenuPosition}
            isMenuVisible={docMenuVisible}
            onEditSuccess={(id, newTitle) => {
              setRecentDocuments((prevDocs) =>
                prevDocs.map((doc) =>
                  doc.id === id ? { ...doc, title: newTitle } : doc
                )
              );
              setDocMenuVisible(false);
            }}
            onDeleteSuccess={() => {
              setDocMenuVisible(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default FrequentSites;
