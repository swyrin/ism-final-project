import React, { useState, useEffect } from "react";
import { FaFilter, FaSort } from "react-icons/fa";
import Filters from "./Filters"; // Import Filters component
import FileList from "./FileList"; // Import FileList component
import AddFileButton from "./AddFileButton"; // Import AddFileButton component

const Body = ({
  filteredDocuments,
  setFilteredDocuments,
  documentId,
  document,
}) => {
  // Keep track of the original documents from the API
  const [originalDocuments, setOriginalDocuments] = useState([]);
  // Keep track of the current filtered documents
  const [currentFiltered, setCurrentFiltered] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize with the documents from props
  useEffect(() => {
    setOriginalDocuments(document.files);
    setCurrentFiltered(filteredDocuments);
  }, [filteredDocuments, document.files]);

  const handleSearch = (category, sortOrder) => {
    console.log("Searching with:", { category, sortOrder });

    // Always start with the original documents for filtering
    let filtered = [...originalDocuments];

    // Apply category filter if not 'all'
    if (category !== "all") {
      filtered = filtered.filter((doc) => doc.cid === category);
    }

    // Sort the filtered results
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.modified_at);
      const dateB = new Date(b.modified_at);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    // Update both the current filtered list and the parent's filtered documents
    setCurrentFiltered(sorted);
    // setFilteredDocuments(sorted);
  };

  return (
    <div className="w-full px-4 md:px-6">
      {/* Top Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              {document.title}
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm w-fit">
              {currentFiltered.length} files
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-3 md:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
            <AddFileButton
              setFilteredDocuments={setFilteredDocuments}
              documentId={documentId}
            />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-3 md:p-4 bg-gray-50 rounded-lg shadow-sm">
            <Filters handleSearch={handleSearch} />
          </div>
        )}
      </div>

      {/* File List */}
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex-1 flex flex-col py-4 md:py-6 w-full">
          <div className="flex flex-col flex-1 w-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            {/* Header Section */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">Files</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <FaSort className="mr-2" />
                  <span>Sorted by date</span>
                </div>
              </div>
            </div>

            {/* FileList Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3 md:py-4">
              <FileList
                filteredDocuments={currentFiltered}
                setFilteredDocuments={setFilteredDocuments}
                documentId={documentId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Body;
