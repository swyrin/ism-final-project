import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaPlus, FaFileAlt, FaClock, FaChartLine, FaUsers, FaBookmark, FaSearch } from 'react-icons/fa';
import Header from './header/Header';
import Sidebar from './sidebar/Sidebar';
import FrequentSites from './frequent-sites/FrequentSites';
import CreateDocumentModal from './CreateDocumentModal';
import { API_URL } from '../../../constant';

const Dashboard = () => {
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    recentViews: 0,
    teamMembers: 0,
    bookmarks: 0
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${API_URL}/home`);
        let data = await response.json();
        let totalFiles = data.total_files;
        let views = data.total_views;
        data = data.documents;

        if (!data || !Array.isArray(data)) {
          console.error('Invalid data format:', data);
          return;
        }

        const starredMap = getStarredFromStorage();

        setRecentDocuments(data.map(doc => ({
          ...doc,
          starred: !!starredMap[doc.id],
          shortDescription: doc.title,
          uploadDate: new Date(doc.modified_at).toLocaleDateString()
        })));

        // Update stats (mock data for now)
        setStats({
          totalDocuments: totalFiles,
          recentViews: views,
          teamMembers: 6,
          bookmarks: Object.keys(starredMap).length
        });
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);

  // Toggle the "starred" state of the document
  const handleStar = (docId) => {
    setRecentDocuments((prevDocs) => {
      const updatedDocs = prevDocs.map((doc) =>
        doc.id === docId ? { ...doc, starred: !doc.starred } : doc
      );

      const starredMap = {};
      updatedDocs.forEach(doc => {
        if (doc.starred) starredMap[doc.id] = true;
      });

      saveStarredToStorage(starredMap);

      return updatedDocs;
    });
  };

  const getStarredFromStorage = () => {
    const stored = localStorage.getItem('starredDocs');
    return stored ? JSON.parse(stored) : {};
  };

  const saveStarredToStorage = (starredMap) => {
    localStorage.setItem('starredDocs', JSON.stringify(starredMap));
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleCardClick = (docId) => {
    navigate(`/page-layout/${docId}`);
  };

  // Function to handle adding a new site
  const addFrequentSite = async (siteName) => {
    try {
      const response = await fetch(`${API_URL}/document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ title: siteName }).toString(),
      });
      const newDoc = await response.json();
      setRecentDocuments(prev => [
        ...prev,
        {
          ...newDoc,
          starred: false,
          shortDescription: newDoc.title,
          uploadDate: new Date(newDoc.modified_at).toLocaleDateString(),
        },
      ]);
    } catch (error) {
      console.error('Error creating new document:', error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header toggleDropdown={toggleDropdown} dropdownOpen={dropdownOpen} />

      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={addFrequentSite}
      />

      <div className="w-screen px-4 py-6">
        {/* Welcome Section */}
        {/* <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Welcome back!</h2>
          <p className="text-gray-600 mt-2">Here's what's happening with your documents today.</p>
        </div> */}

        {/* Quick Stats */}
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

        {/* Quick Actions */}
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
            addFrequentSite={addFrequentSite}
          />
          <FrequentSites
            documents={recentDocuments}
            setRecentDocuments={setRecentDocuments}
            handleStar={handleStar}
            onCardClick={handleCardClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;