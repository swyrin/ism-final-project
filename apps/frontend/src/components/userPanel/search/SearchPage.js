import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilePdf,
  FaEllipsisV,
  FaFilter,
  FaSort,
  FaTimes,
  FaArrowLeft,
  FaCalendarAlt,
  FaTag,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import { API_URL } from "../../../constant";
import FileMenu from "../knowledgeBase/FileMenu";
import ModalCategory from "../knowledgeBase/modalCategory";
import letterColors from '../../../data/colorData';
// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPositions, setMenuPositions] = useState({});
  const [thumbnails, setThumbnails] = useState({});
  const [loadingThumbnails, setLoadingThumbnails] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [initialCategory, setInitialCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [viewingFile, setViewingFile] = useState(null);
  const [fileContent, setFileContent] = useState([]);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/category`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        // Sort categories alphabetically by name (case-insensitive)
        const sortedCategories = [...data].sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase()));
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Load thumbnails when search results change
  useEffect(() => {
    const generateThumbnail = async (pdfFile, id) => {
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);

        // Load the PDF document
        const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
        const page = await pdfDoc.getPage(1);

        // Calculate scale to fit width while maintaining aspect ratio
        const viewport = page.getViewport({ scale: 2.0 }); // Increased scale for better quality

        // Create canvas
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // Set canvas dimensions
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          transform: [1, 0, 0, 1, 0, 0], // No translation, show from top
          intent: "display",
        }).promise;

        // Convert canvas to image URL with better quality
        const imgUrl = canvas.toDataURL("image/jpeg", 1.0);
        setThumbnails((prev) => ({ ...prev, [id]: imgUrl }));
      } catch (error) {
        console.error("Error generating thumbnail:", error);
      } finally {
        setLoadingThumbnails((prev) => ({ ...prev, [id]: false }));
      }
    };

    const loadThumbnails = async () => {
      for (const doc of searchResults) {
        if (!thumbnails[doc.id] && !loadingThumbnails[doc.id]) {
          try {
            setLoadingThumbnails((prev) => ({ ...prev, [doc.id]: true }));
            const response = await fetch(`${API_URL}/file?id=${doc.id}`);
            if (!response.ok) throw new Error("Failed to load thumbnail");
            const blob = await response.blob();
            await generateThumbnail(blob, doc.id);
          } catch (error) {
            console.error("Error loading thumbnail:", error);
          } finally {
            setLoadingThumbnails((prev) => ({ ...prev, [doc.id]: false }));
          }
        }
      }
    };

    loadThumbnails();

    // Cleanup function to revoke object URLs
    return () => {
      Object.values(thumbnails).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [searchResults]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      // Lọc kết quả không phân biệt hoa thường ở frontend
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = (Array.isArray(data) ? data : [data]).filter(
        (doc) =>
          (doc.title || "").toLowerCase().includes(lowerQuery) ||
          (doc.description || "").toLowerCase().includes(lowerQuery)
      );
      setSearchResults(filtered);
    } catch (error) {
      setSearchResults([]);
      alert("Error searching: " + error.message);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPositions(prev => ({
      ...prev,
      [id]: {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      }
    }));
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleClickOutside = () => {
    setActiveMenu(null);
  };

  const resetPageState = () => {
    setSearchResults([]);
    setThumbnails({});
    setLoadingThumbnails({});
    setActiveMenu(null);
    setMenuPositions({});
    setViewingFile(null);
    setFileContent([]);
    setIsLoadingFile(false);
  };

  // File actions handlers
  const handleEditName = async (id) => {
    const newName = prompt("Enter new name:");
    if (newName) {
      try {
        const formData = new URLSearchParams();
        formData.append("id", id);
        formData.append("title", newName);

        const response = await fetch(`${API_URL}/file`, {
          method: "PUT",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        });
        if (!response.ok) throw new Error("Failed to update name");
        
        // Reload the entire page
        window.location.reload();
      } catch (error) {
        alert("Error updating name: " + error.message);
      }
    }
  };

  const handleEditDescription = async (id) => {
    const newDescription = prompt("Enter new description:");
    if (newDescription) {
      try {
        const formData = new URLSearchParams();
        formData.append("id", id);
        formData.append("description", newDescription);

        const response = await fetch(`${API_URL}/file`, {
          method: "PUT",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        });
        if (!response.ok) throw new Error("Failed to update description");
        
        // Reload the entire page
        window.location.reload();
      } catch (error) {
        alert("Error updating description: " + error.message);
      }
    }
  };

  const handleEditCategory = (id) => {
    const doc = searchResults.find((d) => d.id === id);
    setEditingDocId(id);
    setInitialCategory(doc?.cid || "");
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (newCategory) => {
    try {
      const formData = new URLSearchParams();
      formData.append("id", editingDocId);
      formData.append("cid", newCategory);

      const response = await fetch(`${API_URL}/file`, {
        method: "PUT",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!response.ok) throw new Error("Failed to update category");

      // Reload the entire page
      window.location.reload();
    } catch (error) {
      alert("Error updating category: " + error.message);
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      const formData = new URLSearchParams();
      formData.append("id", id);

      const response = await fetch(`${API_URL}/file`, {
        method: "DELETE",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      if (!response.ok) throw new Error("Failed to delete file");
      setSearchResults((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      alert("Error deleting file: " + error.message);
    }
  };

  const handleDownloadFile = async (id) => {
    try {
      const response = await fetch(`${API_URL}/file?id=${id}&download=1`);
      if (!response.ok) throw new Error("Failed to download file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      alert("Error downloading file: " + error.message);
    }
  };

  const handleOpenFileView = async (file) => {
    try {
      // First, update the view count using PATCH
      const response = await fetch(`${API_URL}/file`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          id: file.id,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to update view count');
      }

      // Update the document in the search results with new view count
      setSearchResults(prev =>
        prev.map(item =>
          item.id === file.id
            ? {
                ...item,
                view: (item.view || 0) + 1,
                history: [...(item.history || []), new Date().toISOString()],
                modified_at: new Date().toISOString(),
              }
            : item
        )
      );

      // Navigate to the file viewer page
      navigate(`/file/${file.id}`);
    } catch (error) {
      console.error('Error handling file click:', error);
      alert('Error opening file: ' + error.message);
    }
  };

  const handleCloseFileView = () => {
    setViewingFile(null);
    setFileContent([]);
    // Clean up any object URLs
    fileContent.forEach((url) => URL.revokeObjectURL(url));
  };

  const getNameById = (id) => {
    const category = categories.find((item) => item.id === id);
    return category ? category.name : '';
  };

  const getBorderColor = (initial) => {
    return letterColors[initial] || 'border-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm bg-custom-blue">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          {/* Mobile Layout */}
          <div className="flex flex-col sm:hidden space-y-4">
            {/* Top row: Back button and Filter */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaFilter className="mr-2" />
                Filters
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search files, documents, or keywords..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>

            {/* Search Bar */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search files, documents, or keywords..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FaTag className="mr-2 text-gray-400" />
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-sm md:text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
                  >
                    <option value="All Categories">All Categories</option>
                    {categories.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    Sort By
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-sm md:text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
                  >
                    <option value="Newest First">Newest First</option>
                    <option value="Oldest First">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Searching through documents...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            {searchResults.length > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {searchResults.length} result
                  {searchResults.length !== 1 && "s"} found
                </span>
                <span className="flex items-center">
                  <FaSort className="mr-1" /> Sorted by{" "}
                  {sortOrder.toLowerCase()}
                </span>
              </div>
            )}

            {/* Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl shadow hover:shadow-md border border-gray-100 transition-all duration-200 overflow-hidden">
                  {/* Header with PDF icon and title */}
                  <div className="p-4 flex justify-between items-center border-b border-gray-100">
                    <div
                      className="flex items-center flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleOpenFileView(doc)}
                    >
                      <FaFilePdf className="text-red-500 text-xl" />
                      <h3 className="ml-3 font-semibold text-gray-800 truncate max-w-[180px]">{doc.title || "Untitled Document"}</h3>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {/* Category tag */}
                      {doc.category_name && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${getBorderColor(doc.category_name[0])} border-l-4`}
                        >
                          {doc.category_name}
                        </span>
                      )}
                      <button
                        onClick={(e) => toggleMenu(e, doc.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition"
                      >
                        <FaEllipsisV />
                      </button>
                    </div>
                  </div>

                  {/* PDF thumbnail preview */}
                  <div className="h-fix bg-gray-50 flex items-center justify-center cursor-pointer" onClick={() => handleOpenFileView(doc)}>
                    {loadingThumbnails[doc.id] ? (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
                        <span className="text-xs text-gray-400">Generating preview...</span>
                      </div>
                    ) : thumbnails[doc.id] ? (
                      <img
                        src={thumbnails[doc.id]}
                        alt="PDF Thumbnail"
                        className="w-full h-32 object-cover rounded-lg"
                        style={{ objectPosition: 'top' }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FaFilePdf className="text-gray-300 text-5xl mb-2" />
                        <span className="text-xs text-gray-400">No preview available</span>
                      </div>
                    )}
                  </div>

                  {/* Document description and upload date */}
                  <div className="p-4 cursor-pointer" onClick={() => handleOpenFileView(doc)}>
                    <p className="text-sm text-gray-700 font-medium mb-1">
                      {doc.shortDescription || doc.description || "Untitled Document"}
                    </p>
                    <div className="text-xs text-gray-400">
                      Uploaded: {new Date(doc.modified_at).toLocaleString() || "Date not available"}
                    </div>
                  </div>

                  {/* File Menu */}
                  <FileMenu
                    key={`menu-${doc.id}`}
                    docId={doc.id}
                    isMenuVisible={activeMenu === doc.id}
                    menuPosition={menuPositions[doc.id]}
                    fileData={doc}
                    onEdit={handleEditName}
                    onEditDescription={handleEditDescription}
                    onEditCategory={handleEditCategory}
                    onDelete={handleDeleteFile}
                    onDownload={handleDownloadFile}
                    onClose={handleClickOutside}
                  />
                </div>
              ))}
            </div>

            {/* Empty State */}
            {searchResults.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="text-5xl text-gray-300 mb-2">📄</div>
                <h3 className="text-lg font-semibold text-gray-800">
                  No results found
                </h3>
                <p className="text-gray-500">
                  Try changing your filters or search term.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals and Menus */}
      <ModalCategory
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={handleSaveCategory}
        initialCategory={initialCategory}
      />
    </div>
  );
};

export default SearchPage;
