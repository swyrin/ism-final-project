import CreateDocumentModal from "@www/components/userPanel/dashboard/CreateDocumentModal";
import { useState } from "react";
import { FaPlus, FaStar } from "react-icons/fa";

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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const uniqueTitles = [...new Set(recentDocuments.map((doc) => doc.title))];

  const isTitleStarred = (title: string) => recentDocuments.some((doc) => doc.title === title && doc.starred);

  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-md md:p-6 lg:w-1/5">
      <div className="space-y-4">
        <button
          className="flex w-full items-center rounded-lg border-gray-300 px-3 py-2 text-left text-sm transition hover:bg-blue-50 md:text-base"
          onClick={openModal}
        >
          <FaPlus className="mr-2 text-gray-600" /> Create Site
        </button>

        <CreateDocumentModal isOpen={isModalOpen} onClose={closeModal} onCreate={addFrequentSite} />

        <div>
          <h3 className="text-base font-semibold text-gray-700 md:text-lg">Favorites</h3>
          <div className="mt-2 space-y-2">
            {recentDocuments
              .filter((doc) => doc.starred)
              .map((doc) => (
                <div key={doc.id} className="flex items-center gap-2">
                  <FaStar
                    className="flex-shrink-0 cursor-pointer text-yellow-400"
                    onClick={() => handleStar(doc.id)}
                  />
                  <p className="truncate text-sm text-gray-600 md:text-base">{doc.title}</p>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="mt-4 text-base font-semibold text-gray-700 md:mt-6 md:text-lg">Recent Titles</h3>
          <div className="mt-2 space-y-2">
            {uniqueTitles.length > 0 ? (
              uniqueTitles.map((title, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-600">
                  <FaStar
                    className={`flex-shrink-0 ${isTitleStarred(title) ? "text-yellow-400" : "text-gray-400"}`}
                  />
                  <span className="truncate text-sm md:text-base">{title}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No titles found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
