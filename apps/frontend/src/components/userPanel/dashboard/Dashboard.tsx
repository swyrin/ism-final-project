import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaPlus, FaFileAlt, FaClock, FaChartLine, FaUsers, FaBookmark, FaSearch } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@www/components/userPanel/dashboard/header/Header';
import Sidebar from '@www/components/userPanel/dashboard/sidebar/Sidebar';
import FrequentSites from '@www/components/userPanel/dashboard/frequent-sites/FrequentSites';
import CreateDocumentModal from '@www/components/userPanel/dashboard/CreateDocumentModal';
import { queries, queryKeys, api } from '@www/api';

interface Document {
  id: string;
  title: string;
  starred: boolean;
  shortDescription: string;
  uploadDate: string;
  modified_at: string;
  history?: string[];
}

interface Stats {
  totalDocuments: number;
  recentViews: number;
  teamMembers: number;
  bookmarks: number;
}

const getStarredFromStorage = (): Record<string, boolean> => {
  const stored = localStorage.getItem('starredDocs');
  return stored ? JSON.parse(stored) : {};
};

const saveStarredToStorage = (starredMap: Record<string, boolean>) => {
  localStorage.setItem('starredDocs', JSON.stringify(starredMap));
};

function Dashboard() {
  const [starredOverrides, setStarredOverrides] = useState<Record<string, boolean>>(getStarredFromStorage);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: homeData } = useQuery(queries.home());

  const recentDocuments: Document[] = useMemo(() => {
    if (!homeData?.documents) return [];
    return homeData.documents.map((doc) => ({
      ...doc,
      starred: !!starredOverrides[doc.id],
      shortDescription: doc.title,
      uploadDate: new Date(doc.modified_at).toLocaleDateString(),
    }));
  }, [homeData, starredOverrides]);

  const stats: Stats = useMemo(() => ({
    totalDocuments: homeData?.total_files ?? 0,
    recentViews: homeData?.total_views ?? 0,
    teamMembers: 6,
    bookmarks: Object.keys(starredOverrides).filter((k) => starredOverrides[k]).length,
  }), [homeData, starredOverrides]);

  const addFrequentSiteMutation = useMutation({
    mutationFn: (title: string) => api.document.create(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.home });
    },
  });

  const handleStar = (docId: string) => {
    setStarredOverrides((prev) => {
      const updated = { ...prev, [docId]: !prev[docId] };
      if (!updated[docId]) delete updated[docId];
      saveStarredToStorage(updated);
      return updated;
    });
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleCardClick = (docId: string) => {
    navigate(`/page-layout/${docId}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header toggleDropdown={toggleDropdown} dropdownOpen={dropdownOpen} />

      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(siteName) => addFrequentSiteMutation.mutate(siteName)}
      />

      <div className="w-screen px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                <FaFileAlt className="text-blue-600 text-lg md:text-xl" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-sm text-gray-500">Total Documents</p>
                <p className="text-xl md:text-2xl font-semibold text-gray-800">{stats.totalDocuments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-green-100 rounded-lg">
                <FaClock className="text-green-600 text-lg md:text-xl" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-sm text-gray-500">Recent Views</p>
                <p className="text-xl md:text-2xl font-semibold text-gray-800">{stats.recentViews}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
                <FaUsers className="text-purple-600 text-lg md:text-xl" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-sm text-gray-500">Team Members</p>
                <p className="text-xl md:text-2xl font-semibold text-gray-800">{stats.teamMembers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-yellow-100 rounded-lg">
                <FaBookmark className="text-yellow-600 text-lg md:text-xl" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-sm text-gray-500">Bookmarks</p>
                <p className="text-xl md:text-2xl font-semibold text-gray-800">{stats.bookmarks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/search')}
              className="flex items-center justify-center p-3 md:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <FaSearch className="text-blue-600 mr-2" />
              <span>Search Documents</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center p-3 md:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <FaPlus className="text-green-600 mr-2" />
              <span>Create New Site</span>
            </button>
            <button
              onClick={() => navigate('/bookmarks')}
              className="flex items-center justify-center p-3 md:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <FaBookmark className="text-yellow-600 mr-2" />
              <span>View Bookmarks</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          <Sidebar
            recentDocuments={recentDocuments}
            handleStar={handleStar}
            addFrequentSite={(siteName) => addFrequentSiteMutation.mutate(siteName)}
          />
          <FrequentSites
            documents={recentDocuments}
            setRecentDocuments={() => {}}
            handleStar={handleStar}
            onCardClick={handleCardClick}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
