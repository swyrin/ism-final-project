import CreateDocumentModal from "@www/components/userPanel/dashboard/CreateDocumentModal";
import { useState } from "react";
import { FaPlus, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Document {
  id: string;
  title: string;
  starred?: boolean;
}

interface SidebarProps {
  recentDocuments: Document[];
  handleStar: (docId: string) => void;
  addFrequentSite: (name: string) => void;
}

function Sidebar({ recentDocuments, handleStar, addFrequentSite }: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-md md:p-6 lg:w-1/5">
      <div className="space-y-4">
        <button
          className="flex w-full items-center rounded-lg border-gray-300 px-3 py-2 text-left text-sm transition hover:bg-blue-50 md:text-base"
          onClick={() => setIsModalOpen(true)}
        >
          <FaPlus className="mr-2 text-gray-600" /> Create Site
        </button>

        <CreateDocumentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={addFrequentSite}
        />

        <div>
          <h3 className="text-base font-semibold text-gray-700 md:text-lg">Bookmarked</h3>
          <div className="mt-2 space-y-2">
            {recentDocuments.filter((doc) => doc.starred).length === 0 && (
              <p className="text-sm text-gray-400">No bookmarks yet</p>
            )}
            {recentDocuments
              .filter((doc) => doc.starred)
              .map((doc) => (
                <div key={doc.id} className="flex items-center gap-2">
                  <FaStar
                    className="flex-shrink-0 cursor-pointer text-yellow-400"
                    onClick={() => handleStar(doc.id)}
                  />
                  <button
                    className="truncate text-left text-sm text-gray-600 hover:text-blue-600 md:text-base"
                    onClick={() => navigate(`/page-layout/${doc.id}`)}
                  >
                    {doc.title}
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="mt-4 text-base font-semibold text-gray-700 md:mt-6 md:text-lg">Recent</h3>
          <div className="mt-2 space-y-2">
            {recentDocuments.length > 0 ? (
              recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 text-gray-600">
                  <FaStar
                    className={`flex-shrink-0 cursor-pointer ${doc.starred ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
                    onClick={() => handleStar(doc.id)}
                  />
                  <button
                    className="truncate text-left text-sm hover:text-blue-600 md:text-base"
                    onClick={() => navigate(`/page-layout/${doc.id}`)}
                  >
                    {doc.title}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No documents yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
