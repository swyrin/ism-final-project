import { useState } from 'react';
import { FaPlus, FaStar } from 'react-icons/fa';
import CreateDocumentModal from '@www/components/userPanel/dashboard/CreateDocumentModal';

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

  const uniqueTitles = [...new Set(recentDocuments.map(doc => doc.title))];

  const isTitleStarred = (title: string) =>
    recentDocuments.some(doc => doc.title === title && doc.starred);

  return (
    <div className="w-full lg:w-1/5 bg-white p-4 md:p-6 rounded-xl shadow-md">
      <div className="space-y-4">
        <button
          className="w-full py-2 px-3 text-left border-gray-300 rounded-lg flex items-center hover:bg-blue-50 transition text-sm md:text-base"
          onClick={openModal}
        >
          <FaPlus className="mr-2 text-gray-600" /> Create Site
        </button>

        <CreateDocumentModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onCreate={addFrequentSite}
        />

        <div>
          <h3 className="font-semibold text-base md:text-lg text-gray-700">Favorites</h3>
          <div className="space-y-2 mt-2">
            {recentDocuments
              .filter(doc => doc.starred)
              .map(doc => (
                <div key={doc.id} className="flex items-center gap-2">
                  <FaStar
                    className="cursor-pointer text-yellow-400 flex-shrink-0"
                    onClick={() => handleStar(doc.id)}
                  />
                  <p className="text-gray-600 text-sm md:text-base truncate">{doc.title}</p>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-base md:text-lg text-gray-700 mt-4 md:mt-6">Recent Titles</h3>
          <div className="space-y-2 mt-2">
            {uniqueTitles.length > 0 ? (
              uniqueTitles.map((title, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-600">
                  <FaStar className={`flex-shrink-0 ${isTitleStarred(title) ? 'text-yellow-400' : 'text-gray-400'}`} />
                  <span className="text-sm md:text-base truncate">{title}</span>
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
