import type { SearchResult } from "@www/api";
import type { KeyboardEvent, MouseEvent } from "react";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api, queryKeys } from "@www/api";
import FileMenu from "@www/components/userPanel/knowledgeBase/FileMenu";
import ModalCategory from "@www/components/userPanel/knowledgeBase/modalCategory";
import { API_URL } from "@www/constant";
import letterColors from "@www/data/colorData";
import * as pdfjsLib from "pdfjs-dist";
import { useState, useEffect } from "react";
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
import { useNavigate, useSearchParams } from "react-router-dom";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [submittedQuery, setSubmittedQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPositions, setMenuPositions] = useState<Record<string, { top: number; left: number }>>({});
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState<Record<string, boolean>>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [initialCategory, setInitialCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.category.list,
  });

  const { data: rawResults = [], isFetching: loading } = useQuery({
    queryKey: queryKeys.search(submittedQuery),
    queryFn: () => api.search.query(submittedQuery),
    enabled: Boolean(submittedQuery),
  });

  const searchResults: SearchResult[] = rawResults.filter((doc) => {
    const lq = submittedQuery.toLowerCase();
    return (doc.title || "").toLowerCase().includes(lq) || (doc.description || "").toLowerCase().includes(lq);
  });

  const updateFileMutation = useMutation({
    mutationFn: (params: URLSearchParams) => api.file.update(params),
    onSuccess: () => {
      window.location.reload();
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (id: string) => api.file.delete(id),
    onSuccess: (_data, id) => {
      // Remove from results (filtered client-side since we can't invalidate easily)
      window.location.reload();
    },
    onError: (err) => {
      alert("Error deleting file: " + (err as Error).message);
    },
  });

  const addViewMutation = useMutation({
    mutationFn: (id: string) => api.file.addView(id),
  });

  // Generate thumbnails
  useEffect(() => {
    const generateThumbnail = async (pdfBlob: Blob, id: string) => {
      try {
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport, intent: "display" }).promise;
        setThumbnails((prev) => ({ ...prev, [id]: canvas.toDataURL("image/jpeg", 1) }));
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
            if (!response.ok) {
              throw new Error("Failed to load thumbnail");
            }
            const blob = await response.blob();
            await generateThumbnail(blob, doc.id);
          } catch (error) {
            console.error("Error loading thumbnail:", error);
            setLoadingThumbnails((prev) => ({ ...prev, [doc.id]: false }));
          }
        }
      }
    };

    if (searchResults.length > 0) {
      loadThumbnails();
    }
  }, [searchResults]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => setSubmittedQuery(searchQuery);
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleMenu = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPositions((prev) => ({
      ...prev,
      [id]: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX },
    }));
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleEditName = (id: string) => {
    const newName = prompt("Enter new name:");
    if (newName) {
      updateFileMutation.mutate(new URLSearchParams({ id, title: newName }));
    }
  };

  const handleEditDescription = (id: string) => {
    const newDescription = prompt("Enter new description:");
    if (newDescription) {
      updateFileMutation.mutate(new URLSearchParams({ id, description: newDescription }));
    }
  };

  const handleEditCategory = (id: string) => {
    const doc = searchResults.find((d) => d.id === id);
    setEditingDocId(id);
    setInitialCategory(doc?.cid || "");
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (newCategory: string) => {
    if (!editingDocId) {
      return;
    }
    updateFileMutation.mutate(new URLSearchParams({ id: editingDocId, cid: newCategory }));
  };

  const handleDeleteFile = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }
    deleteFileMutation.mutate(id);
  };

  const handleDownloadFile = (id: string) => {
    const a = document.createElement("a");
    a.href = `${API_URL}/file?id=${id}&download=1`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleOpenFileView = (file: SearchResult) => {
    addViewMutation.mutate(file.id);
    navigate(`/file/${file.id}`);
  };

  const getBorderColor = (initial: string) => letterColors[initial] || "border-gray-500";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-custom-blue bg-white shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col space-y-4 sm:hidden">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <FaFilter className="mr-2" />
                Filters
              </button>
            </div>
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search files, documents, or keywords..."
                className="w-full rounded-lg border border-gray-300 py-3 pr-10 pl-10 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <button
              onClick={() => navigate("/")}
              className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
            <div className="relative min-w-[200px] flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search files, documents, or keywords..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pr-10 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FaTag className="mr-2 text-gray-400" />
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full rounded-md border-gray-300 bg-white py-2 pr-10 pl-3 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="All Categories">All Categories</option>
                    {categories.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    Sort By
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="block w-full rounded-md border-gray-300 bg-white py-2 pr-10 pl-3 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
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

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600">Searching through documents...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {searchResults.length > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {searchResults.length} result{searchResults.length !== 1 && "s"} found
                </span>
                <span className="flex items-center">
                  <FaSort className="mr-1" /> Sorted by {sortOrder.toLowerCase()}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((doc) => (
                <div
                  key={doc.id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 p-4">
                    <div
                      className="flex min-w-0 flex-1 cursor-pointer items-center"
                      onClick={() => handleOpenFileView(doc)}
                    >
                      <FaFilePdf className="text-xl text-red-500" />
                      <h3 className="ml-3 max-w-[180px] truncate font-semibold text-gray-800">
                        {doc.title || "Untitled Document"}
                      </h3>
                    </div>
                    <div className="ml-2 flex items-center gap-2">
                      {doc.category_name && (
                        <span
                          className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${getBorderColor(doc.category_name[0])} border-l-4`}
                        >
                          {doc.category_name}
                        </span>
                      )}
                      <button
                        onClick={(e) => toggleMenu(e, doc.id)}
                        className="rounded-full p-1 text-gray-400 transition hover:text-gray-600"
                      >
                        <FaEllipsisV />
                      </button>
                    </div>
                  </div>

                  <div
                    className="h-fix flex cursor-pointer items-center justify-center bg-gray-50"
                    onClick={() => handleOpenFileView(doc)}
                  >
                    {loadingThumbnails[doc.id] ? (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <div className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-400" />
                        <span className="text-xs text-gray-400">Generating preview...</span>
                      </div>
                    ) : thumbnails[doc.id] ? (
                      <img
                        src={thumbnails[doc.id]}
                        alt="PDF Thumbnail"
                        className="h-32 w-full rounded-lg object-cover"
                        style={{ objectPosition: "top" }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FaFilePdf className="mb-2 text-5xl text-gray-300" />
                        <span className="text-xs text-gray-400">No preview available</span>
                      </div>
                    )}
                  </div>

                  <div className="cursor-pointer p-4" onClick={() => handleOpenFileView(doc)}>
                    <p className="mb-1 text-sm font-medium text-gray-700">
                      {doc.description || "Untitled Document"}
                    </p>
                    <div className="text-xs text-gray-400">
                      Uploaded:{" "}
                      {doc.modified_at ? new Date(doc.modified_at).toLocaleString() : "Date not available"}
                    </div>
                  </div>

                  <FileMenu
                    key={`menu-${doc.id}`}
                    docId={doc.id}
                    isMenuVisible={activeMenu === doc.id}
                    menuPosition={menuPositions[doc.id] || null}
                    onEdit={() => handleEditName(doc.id)}
                    onEditDescription={() => handleEditDescription(doc.id)}
                    onEditCategory={() => handleEditCategory(doc.id)}
                    onDelete={() => handleDeleteFile(doc.id)}
                    onDownload={() => handleDownloadFile(doc.id)}
                    onInfo={() => {}}
                    onClose={() => setActiveMenu(null)}
                  />
                </div>
              ))}
            </div>

            {searchResults.length === 0 && !loading && (
              <div className="py-16 text-center">
                <div className="mb-2 text-5xl text-gray-300">📄</div>
                <h3 className="text-lg font-semibold text-gray-800">No results found</h3>
                <p className="text-gray-500">Try changing your filters or search term.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ModalCategory
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={handleSaveCategory}
        initialCategory={initialCategory}
      />
    </div>
  );
}

export default SearchPage;
