import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queries, queryKeys, api } from "@www/api";
import CreateDocumentModal from "@www/components/userPanel/dashboard/CreateDocumentModal";
import FrequentSites from "@www/components/userPanel/dashboard/frequent-sites/FrequentSites";
import Header from "@www/components/userPanel/dashboard/header/Header";
import Sidebar from "@www/components/userPanel/dashboard/sidebar/Sidebar";
import { useState, useMemo } from "react";
import {
  FaStar,
  FaPlus,
  FaFileAlt,
  FaClock,
  FaChartLine,
  FaUsers,
  FaBookmark,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
  const stored = localStorage.getItem("starredDocs");
  return stored ? JSON.parse(stored) : {};
};

const saveStarredToStorage = (starredMap: Record<string, boolean>) => {
  localStorage.setItem("starredDocs", JSON.stringify(starredMap));
};

function Dashboard() {
  const [starredOverrides, setStarredOverrides] = useState<Record<string, boolean>>(getStarredFromStorage);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: homeData } = useQuery(queries.home());

  const recentDocuments: Document[] = useMemo(() => {
    if (!homeData?.documents) {
      return [];
    }
    return homeData.documents.map((doc) => ({
      ...doc,
      starred: Boolean(starredOverrides[doc.id]),
      shortDescription: doc.title,
      uploadDate: new Date(doc.modified_at).toLocaleDateString(),
    }));
  }, [homeData, starredOverrides]);

  const stats: Stats = useMemo(
    () => ({
      totalDocuments: homeData?.total_files ?? 0,
      recentViews: homeData?.total_views ?? 0,
      teamMembers: 6,
      bookmarks: Object.keys(starredOverrides).filter((k) => starredOverrides[k]).length,
    }),
    [homeData, starredOverrides],
  );

  const addFrequentSiteMutation = useMutation({
    mutationFn: (title: string) => api.document.create(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.home });
    },
  });

  const visibleDocuments = showBookmarked ? recentDocuments.filter((d) => d.starred) : recentDocuments;

  const handleStar = (docId: string) => {
    setStarredOverrides((prev) => {
      const updated = { ...prev, [docId]: !prev[docId] };
      if (!updated[docId]) {
        delete updated[docId];
      }
      saveStarredToStorage(updated);
      return updated;
    });
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleCardClick = (docId: string) => {
    navigate(`/page-layout/${docId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header toggleDropdown={toggleDropdown} dropdownOpen={dropdownOpen} />

      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(siteName) => addFrequentSiteMutation.mutate(siteName)}
      />

      <div className="w-screen px-4 py-6">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-2 md:p-3">
                <FaFileAlt className="text-lg text-blue-600 md:text-xl" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-sm text-gray-500">Total Documents</p>
                <p className="text-xl font-semibold text-gray-800 md:text-2xl">{stats.totalDocuments}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-2 md:p-3">
                <FaClock className="text-lg text-green-600 md:text-xl" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-sm text-gray-500">Recent Views</p>
                <p className="text-xl font-semibold text-gray-800 md:text-2xl">{stats.recentViews}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-purple-100 p-2 md:p-3">
                <FaUsers className="text-lg text-purple-600 md:text-xl" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-sm text-gray-500">Team Members</p>
                <p className="text-xl font-semibold text-gray-800 md:text-2xl">{stats.teamMembers}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-yellow-100 p-2 md:p-3">
                <FaBookmark className="text-lg text-yellow-600 md:text-xl" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-sm text-gray-500">Bookmarks</p>
                <p className="text-xl font-semibold text-gray-800 md:text-2xl">{stats.bookmarks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 md:text-xl">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => navigate("/search")}
              className="flex items-center justify-center rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:p-4"
            >
              <FaSearch className="mr-2 text-blue-600" />
              <span>Search Documents</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md md:p-4"
            >
              <FaPlus className="mr-2 text-green-600" />
              <span>Create New Site</span>
            </button>
            <button
              onClick={() => setShowBookmarked((v) => !v)}
              className={`flex items-center justify-center rounded-xl p-3 shadow-sm transition-shadow hover:shadow-md md:p-4 ${showBookmarked ? "bg-yellow-50 ring-2 ring-yellow-400" : "bg-white"}`}
            >
              <FaBookmark className="mr-2 text-yellow-600" />
              <span>{showBookmarked ? "Show All" : "Show Bookmarked"}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:gap-6 lg:flex-row">
          <Sidebar
            recentDocuments={visibleDocuments}
            handleStar={handleStar}
            addFrequentSite={(siteName) => addFrequentSiteMutation.mutate(siteName)}
          />
          <FrequentSites
            documents={visibleDocuments}
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
