import { useState, useEffect, KeyboardEvent, MouseEvent } from 'react';
import {
  FaSearch, FaFilePdf, FaEllipsisV, FaFilter, FaSort,
  FaTimes, FaArrowLeft, FaCalendarAlt, FaTag,
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as pdfjsLib from 'pdfjs-dist';
import FileMenu from '@www/components/userPanel/knowledgeBase/FileMenu';
import ModalCategory from '@www/components/userPanel/knowledgeBase/modalCategory';
import letterColors from '@www/data/colorData';
import { api, queryKeys, SearchResult } from '@www/api';
import { API_URL } from '@www/constant';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [submittedQuery, setSubmittedQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPositions, setMenuPositions] = useState<Record<string, { top: number; left: number }>>({});
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState<Record<string, boolean>>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [initialCategory, setInitialCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.category.list,
  });

  const { data: rawResults = [], isFetching: loading } = useQuery({
    queryKey: queryKeys.search(submittedQuery),
    queryFn: () => api.search.query(submittedQuery),
    enabled: !!submittedQuery,
  });

  const searchResults: SearchResult[] = rawResults.filter((doc) => {
    const lq = submittedQuery.toLowerCase();
    return (
      (doc.title || '').toLowerCase().includes(lq) ||
      (doc.description || '').toLowerCase().includes(lq)
    );
  });

  const updateFileMutation = useMutation({
    mutationFn: (params: URLSearchParams) => api.file.update(params),
    onSuccess: () => { window.location.reload(); },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (id: string) => api.file.delete(id),
    onSuccess: (_data, id) => {
      // Remove from results (filtered client-side since we can't invalidate easily)
      window.location.reload();
    },
    onError: (err) => { alert('Error deleting file: ' + (err as Error).message); },
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
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport, intent: 'display' }).promise;
        setThumbnails((prev) => ({ ...prev, [id]: canvas.toDataURL('image/jpeg', 1.0) }));
      } catch (error) {
        console.error('Error generating thumbnail:', error);
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
            if (!response.ok) throw new Error('Failed to load thumbnail');
            const blob = await response.blob();
            await generateThumbnail(blob, doc.id);
          } catch (error) {
            console.error('Error loading thumbnail:', error);
            setLoadingThumbnails((prev) => ({ ...prev, [doc.id]: false }));
          }
        }
      }
    };

    if (searchResults.length > 0) loadThumbnails();
  }, [searchResults]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => setSubmittedQuery(searchQuery);
  const handleKeyPress = (e: KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

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
    const newName = prompt('Enter new name:');
    if (newName) updateFileMutation.mutate(new URLSearchParams({ id, title: newName }));
  };

  const handleEditDescription = (id: string) => {
    const newDescription = prompt('Enter new description:');
    if (newDescription) updateFileMutation.mutate(new URLSearchParams({ id, description: newDescription }));
  };

  const handleEditCategory = (id: string) => {
    const doc = searchResults.find((d) => d.id === id);
    setEditingDocId(id);
    setInitialCategory(doc?.cid || '');
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (newCategory: string) => {
    if (!editingDocId) return;
    updateFileMutation.mutate(new URLSearchParams({ id: editingDocId, cid: newCategory }));
  };

  const handleDeleteFile = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    deleteFileMutation.mutate(id);
  };

  const handleDownloadFile = (id: string) => {
    const a = document.createElement('a');
    a.href = `${API_URL}/file?id=${id}&download=1`;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleOpenFileView = (file: SearchResult) => {
    addViewMutation.mutate(file.id);
    navigate(`/file/${file.id}`);
  };

  const getBorderColor = (initial: string) => letterColors[initial] || 'border-gray-500';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm bg-custom-blue">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:hidden space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => navigate('/')} className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <FaArrowLeft className="mr-2" />Back to Dashboard
              </button>
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <FaFilter className="mr-2" />Filters
              </button>
            </div>
            <div className="relative w-full">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleKeyPress}
                placeholder="Search files, documents, or keywords..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button onClick={() => navigate('/')} className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <FaArrowLeft className="mr-2" />Back to Dashboard
            </button>
            <div className="relative flex-1 min-w-[200px]">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleKeyPress}
                placeholder="Search files, documents, or keywords..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              )}
            </div>
            <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">Search</button>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <FaFilter className="mr-2" />Filters
            </button>
          </div>

          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FaTag className="mr-2 text-gray-400" />Category
                  </label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white">
                    <option value="All Categories">All Categories</option>
                    {categories.map((option) => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <FaCalendarAlt className="mr-2 text-gray-400" />Sort By
                  </label>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white">
                    <option value="Newest First">Newest First</option>
                    <option value="Oldest First">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Searching through documents...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {searchResults.length > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{searchResults.length} result{searchResults.length !== 1 && 's'} found</span>
                <span className="flex items-center"><FaSort className="mr-1" /> Sorted by {sortOrder.toLowerCase()}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl shadow hover:shadow-md border border-gray-100 transition-all duration-200 overflow-hidden">
                  <div className="p-4 flex justify-between items-center border-b border-gray-100">
                    <div className="flex items-center flex-1 min-w-0 cursor-pointer" onClick={() => handleOpenFileView(doc)}>
                      <FaFilePdf className="text-red-500 text-xl" />
                      <h3 className="ml-3 font-semibold text-gray-800 truncate max-w-[180px]">{doc.title || 'Untitled Document'}</h3>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {doc.category_name && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${getBorderColor(doc.category_name[0])} border-l-4`}>
                          {doc.category_name}
                        </span>
                      )}
                      <button onClick={(e) => toggleMenu(e, doc.id)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition">
                        <FaEllipsisV />
                      </button>
                    </div>
                  </div>

                  <div className="h-fix bg-gray-50 flex items-center justify-center cursor-pointer" onClick={() => handleOpenFileView(doc)}>
                    {loadingThumbnails[doc.id] ? (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
                        <span className="text-xs text-gray-400">Generating preview...</span>
                      </div>
                    ) : thumbnails[doc.id] ? (
                      <img src={thumbnails[doc.id]} alt="PDF Thumbnail" className="w-full h-32 object-cover rounded-lg" style={{ objectPosition: 'top' }} />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FaFilePdf className="text-gray-300 text-5xl mb-2" />
                        <span className="text-xs text-gray-400">No preview available</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 cursor-pointer" onClick={() => handleOpenFileView(doc)}>
                    <p className="text-sm text-gray-700 font-medium mb-1">{doc.description || 'Untitled Document'}</p>
                    <div className="text-xs text-gray-400">Uploaded: {doc.modified_at ? new Date(doc.modified_at).toLocaleString() : 'Date not available'}</div>
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
              <div className="text-center py-16">
                <div className="text-5xl text-gray-300 mb-2">📄</div>
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
