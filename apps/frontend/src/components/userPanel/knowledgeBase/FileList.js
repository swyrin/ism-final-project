import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { FaEllipsisV, FaFilePdf, FaEdit, FaTag, FaDownload, FaTrash } from "react-icons/fa";
import FileMenu from "./FileMenu"; // Import component menu ba chấm
import { API_URL } from "../../../constant";
import ModalCategory from "./modalCategory";
import PageViewer from "./PageViewer";
import letterColors from "../../../data/colorData";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const FileList = ({ filteredDocuments, setFilteredDocuments }) => {
  const navigate = useNavigate();
  const [thumbnails, setThumbnails] = useState({}); // State để lưu ảnh thumbnail của các file PDF
  const [activeMenu, setActiveMenu] = useState(null); // State để quản lý menu ba chấm
  const [menuPosition, setMenuPosition] = useState(null); // State để lưu vị trí của menu
  const [loadingThumbnails, setLoadingThumbnails] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryEditDoc, setCategoryEditDoc] = useState(null);
  // New state for selected file modal
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMenuVisible, setFileMenuVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  // Add new state for info modal
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoData, setInfoData] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/category`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        
        // Sort categories alphabetically by name
        const sortedCategories = [...data].sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        console.log('Original categories:', data);
        console.log('Sorted categories:', sortedCategories);
        
        setCategories(sortedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Generate thumbnails when documents change
  useEffect(() => {
    // Function to generate thumbnail from PDF
    const generateThumbnail = async (pdfFile, id) => {
      if (!pdfFile || loadingThumbnails[id]) return;

      try {
        setLoadingThumbnails((prev) => ({ ...prev, [id]: true }));

        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);

        const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
        const page = await pdfDoc.getPage(1);

        // Calculate scale to fit width
        const scale = 2;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // Set canvas dimensions
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render only the top portion of the page
        await page.render({
          canvasContext: context,
          viewport: viewport,
          transform: [1, 0, 0, 1, 0, 0], // No translation, show from top
          intent: "display",
        }).promise;

        const imgUrl = canvas.toDataURL("image/jpeg", 1);

        setThumbnails((prev) => ({
          ...prev,
          [id]: imgUrl,
        }));
      } catch (error) {
        console.error(
          "Error generating thumbnail for document",
          id,
          ":",
          error
        );
      } finally {
        setLoadingThumbnails((prev) => ({ ...prev, [id]: false }));
      }
    };

    const generateThumbnailsForDocuments = async () => {
      for (const doc of filteredDocuments) {
        if (!thumbnails[doc.id]) {
          try {
            setLoadingThumbnails((prev) => ({ ...prev, [doc.id]: true }));

            // Fetch PDF từ API
            const response = await fetch(`${API_URL}/file?id=${doc.id}`);
            if (!response.ok) throw new Error(`Failed to fetch file ${doc.id}`);
            const blob = await response.blob();

            // Gọi generateThumbnail
            await generateThumbnail(blob, doc.id);
          } catch (error) {
            console.error("Error loading PDF for thumbnail:", error);
          } finally {
            setLoadingThumbnails((prev) => ({ ...prev, [doc.id]: false }));
          }
        }
      }
    };

    generateThumbnailsForDocuments();
  }, [filteredDocuments]);

  // Hàm hiển thị menu khi click vào ba chấm
  const toggleMenu = (e, id) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 192; // Width of the menu (w-48 = 12rem = 192px)
    const windowWidth = window.innerWidth;
    
    // Check if menu would overflow on the right
    const wouldOverflowRight = rect.left + menuWidth > windowWidth;
    
    setMenuPosition({
      top: 0,
      left: wouldOverflowRight ? -menuWidth : 0
    });
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleClickOutside = () => {
    setActiveMenu(null);
  };

  // Update handleShowInfo function
  const handleShowInfo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/file?id=${id}&detail=1`);
      if (!response.ok) throw new Error('Failed to fetch file info');
      const data = await response.json();
      setInfoData(data);
      setShowInfoModal(true);
    } catch (error) {
      alert('Error fetching file info: ' + error.message);
    }
  };

  // Add function to close info modal
  const handleCloseInfoModal = () => {
    setShowInfoModal(false);
    setInfoData(null);
  };

  // Hàm xử lý sửa tên file
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
        // setFilteredDocuments((prev) =>
        //   prev.map((doc) => (doc.id === id ? { ...doc, title: newName } : doc))
        // );
        window.location.reload()
      } catch (error) {
        alert("Error updating name: " + error.message);
      }
    }
  };

  // Hàm xử lý sửa mô tả file
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
        // setFilteredDocuments((prev) =>
        //   prev.map((doc) =>
        //     doc.id === id ? { ...doc, description: newDescription } : doc
        //   )
        // );
        window.location.reload()
      } catch (error) {
        alert("Error updating description: " + error.message);
      }
    }
  };

  // Hàm xử lý sửa category file (now opens modal)
  const handleEditCategory = (id) => {
    const doc = filteredDocuments.find((doc) => doc.id === id);
    if (!doc) return;
    setCategoryEditDoc(doc);
    setShowCategoryModal(true);
  };

  // Save handler for ModalCategory
  const handleSaveCategory = async (id) => {
    if (!categoryEditDoc) return;
    try {
      const formData = new URLSearchParams();
      formData.append("id", categoryEditDoc.id);
      formData.append("cid", id);
      const response = await fetch(`${API_URL}/file`, {
        method: "PUT",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      if (!response.ok) throw new Error("Failed to update category");

      // setFilteredDocuments((prev) =>
      //   prev.map((doc) =>
      //     doc.id === categoryEditDoc.id
      //       ? { ...doc, category: getNameById(id) }
      //       : doc
      //   )
      // );
      // setShowCategoryModal(false);
      // setCategoryEditDoc(null);
      window.location.reload()
    } catch (error) {
      alert("Error updating category: " + error.message);
    }
  };

  // Hàm xử lý xóa file
  const handleDeleteFile = async (id) => {
    try {
      const formData = new URLSearchParams();
      formData.append("id", id);

      const response = await fetch(`${API_URL}/file`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });
      if (!response.ok) throw new Error("Failed to delete file");
      setFilteredDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      alert("Error deleting file: " + error.message);
    }
  };

  // Hàm xử lý tải xuống file
  const handleDownloadFile = async (id) => {
    try {
      if (!id) {
        alert("Invalid file for download");
        return;
      }
      // const response = await fetch(`${API_URL}/file?id=${id}&download=1`);
      // if (!response.ok) throw new Error('Failed to download file');
      // const blob = await response.blob();

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = `${API_URL}/file?id=${id}&download=1`;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert("Error downloading file: " + error.message);
    }
  };

  // New function to handle file click
  const handleFileClick = async (doc) => {
    try {
      // First, update the view count using PATCH
      const patchResponse = await axios.patch(
        `${API_URL}/file`,
        {
          id: doc.id,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (patchResponse.status !== 200) {
        throw new Error("Failed to update view count");
      }

      // Update the document in the filteredDocuments list with new view count
      setFilteredDocuments((prev) =>
        prev.map((item) =>
          item.id === doc.id
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
      navigate(`/file/${doc.id}`);
    } catch (error) {
      console.error("Error handling file click:", error);
      alert("Error opening file: " + error.message);
    }
  };

  const getNameById = (id) => {
    if (!id) return "";
    // Convert both the input id and category.id to numbers for comparison
    const category = categories.find((item) => Number(item.id) === Number(id));
    console.log('Category ID:', id, 'Type:', typeof id);
    console.log('All Categories:', categories);
    console.log('Found Category:', category);
    return category ? category.name : id; // Return the ID if category not found
  };

  const getBorderColor = (initial) => {
    return letterColors[initial] || "border-gray-500";
    // Convert border color to background color
    // return colorClass.replace('border-', 'bg-');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredDocuments.map((doc) => (
        <div
          key={doc.id}
          className="bg-white rounded-2xl shadow hover:shadow-md border border-gray-100 transition-all duration-200 overflow-hidden"
        >
          <div className="p-4 flex flex-col gap-2 border-b border-gray-100">
            {/* Title and menu button */}
            <div className="flex items-center justify-between">
              <div
                className="flex items-center flex-1 min-w-0 cursor-pointer"
                onClick={() => handleFileClick(doc)}
              >
                <FaFilePdf className="text-red-500 text-xl flex-shrink-0" />
                <h3 className="ml-3 font-semibold text-gray-800 truncate max-w-[140px]">
                  {doc.title || "Untitled Document"}
                </h3>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(e, doc.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition hover:bg-gray-100"
                >
                  <FaEllipsisV />
                </button>
                <FileMenu
                  docId={doc.id}
                  isMenuVisible={activeMenu === doc.id}
                  menuPosition={menuPosition}
                  onEdit={() => handleEditName(doc.id)}
                  onEditDescription={() => handleEditDescription(doc.id)}
                  onEditCategory={() => handleEditCategory(doc.id)}
                  onDelete={() => handleDeleteFile(doc.id)}
                  onDownload={() => handleDownloadFile(doc.id)}
                  onInfo={() => handleShowInfo(doc.id)}
                  onClose={handleClickOutside}
                />
              </div>
            </div>
            
            {/* Category tag */}
            {doc.category_name && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${getBorderColor(
                  doc.category_name[0]
                )} border-l-4`}
              >
                {doc.category_name}
              </span>
            )}
          </div>

          {/* PDF thumbnail preview */}
          <div
            className="h-fix bg-gray-50 flex items-center justify-center cursor-pointer"
            onClick={() => handleFileClick(doc)}
          >
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
                style={{ objectPosition: "top" }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <FaFilePdf className="text-gray-300 text-5xl mb-2" />
                <span className="text-xs text-gray-400">No preview available</span>
              </div>
            )}
          </div>

          {/* Document description and upload date */}
          <div
            className="p-4 cursor-pointer"
            onClick={() => handleFileClick(doc)}
          >
            <p className="text-sm text-gray-700 font-medium mb-1 line-clamp-2">
              {doc.shortDescription || doc.description || "Untitled Document"}
            </p>
            <div className="text-xs text-gray-400">
              Uploaded: {new Date(doc.modified_at).toLocaleString() || "Date not available"}
            </div>
          </div>
        </div>
      ))}
      <ModalCategory
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setCategoryEditDoc(null);
        }}
        onSave={handleSaveCategory}
        initialCategory={categoryEditDoc ? categoryEditDoc.category : ""}
      />
      {/* Page Viewer Modal */}
      {selectedFile && (
        <PageViewer
          selectedFile={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}

      {/* Info Modal */}
      {showInfoModal && infoData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-semibold text-gray-800">File Information</h4>
              <button
                onClick={handleCloseInfoModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-medium text-gray-600">Title:</span>
                <span className="text-gray-800">{infoData.title || 'Untitled'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-medium text-gray-600">Description:</span>
                <span className="text-gray-800">{infoData.description || 'No description'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-medium text-gray-600">Category:</span>
                <span className="text-gray-800">
                  {infoData.cid ? getNameById(infoData.cid) : 'Uncategorized'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-medium text-gray-600">Author:</span>
                <span className="text-gray-800">{infoData.author || 'Unknown'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-medium text-gray-600">Modified at:</span>
                <span className="text-gray-800">
                  {infoData.modified_at ? new Date(infoData.modified_at).toLocaleString() : 'Unknown'}
                </span>
              </div>
              {infoData.history && infoData.history.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-600">View History:</span>
                  <div className="max-h-32 overflow-y-auto">
                    {infoData.history.map((date, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {new Date(date).toLocaleString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;
