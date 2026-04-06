import { useState, useEffect, Dispatch, SetStateAction, MouseEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FaEllipsisV, FaFilePdf } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import FileMenu from '@www/components/userPanel/knowledgeBase/FileMenu';
import ModalCategory from '@www/components/userPanel/knowledgeBase/modalCategory';
import PageViewer from '@www/components/userPanel/knowledgeBase/PageViewer';
import letterColors from '@www/data/colorData';
import { api, queryKeys, FileRecord } from '@www/api';
import { API_URL } from '@www/constant';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface MenuPosition {
  top: number;
  left: number;
}

interface FileListProps {
  filteredDocuments: FileRecord[];
  setFilteredDocuments: Dispatch<SetStateAction<FileRecord[]>>;
  documentId: string;
}

function FileList({ filteredDocuments, setFilteredDocuments }: FileListProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [loadingThumbnails, setLoadingThumbnails] = useState<Record<string, boolean>>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryEditDoc, setCategoryEditDoc] = useState<FileRecord | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoFileId, setInfoFileId] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.category.list,
  });

  const { data: infoData } = useQuery({
    queryKey: queryKeys.fileInfo(infoFileId!),
    queryFn: () => api.file.getInfo(infoFileId!),
    enabled: !!infoFileId && showInfoModal,
  });

  const addViewMutation = useMutation({
    mutationFn: (id: string) => api.file.addView(id),
    onSuccess: (updatedFile) => {
      setFilteredDocuments((prev) =>
        prev.map((item) => (item.id === updatedFile.id ? { ...item, ...updatedFile } : item))
      );
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: (params: URLSearchParams) => api.file.update(params),
    onSuccess: () => { window.location.reload(); },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (id: string) => api.file.delete(id),
    onSuccess: (_data, id) => {
      setFilteredDocuments((prev) => prev.filter((doc) => doc.id !== id));
    },
    onError: (err) => { alert('Error deleting file: ' + (err as Error).message); },
  });

  // Generate thumbnails when documents change
  useEffect(() => {
    const generateThumbnail = async (pdfBlob: Blob, id: string) => {
      if (loadingThumbnails[id]) return;
      try {
        setLoadingThumbnails((prev) => ({ ...prev, [id]: true }));
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport, intent: 'display' }).promise;
        setThumbnails((prev) => ({ ...prev, [id]: canvas.toDataURL('image/jpeg', 1) }));
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      } finally {
        setLoadingThumbnails((prev) => ({ ...prev, [id]: false }));
      }
    };

    const generateAll = async () => {
      for (const doc of filteredDocuments) {
        if (!thumbnails[doc.id]) {
          try {
            setLoadingThumbnails((prev) => ({ ...prev, [doc.id]: true }));
            const response = await fetch(`${API_URL}/file?id=${doc.id}`);
            if (!response.ok) throw new Error(`Failed to fetch file ${doc.id}`);
            const blob = await response.blob();
            await generateThumbnail(blob, doc.id);
          } catch (error) {
            console.error('Error loading PDF for thumbnail:', error);
          } finally {
            setLoadingThumbnails((prev) => ({ ...prev, [doc.id]: false }));
          }
        }
      }
    };

    generateAll();
  }, [filteredDocuments]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMenu = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 192;
    const wouldOverflowRight = rect.left + menuWidth > window.innerWidth;
    setMenuPosition({ top: 0, left: wouldOverflowRight ? -menuWidth : 0 });
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleEditName = async (id: string) => {
    const newName = prompt('Enter new name:');
    if (newName) {
      const params = new URLSearchParams({ id, title: newName });
      updateFileMutation.mutate(params);
    }
  };

  const handleEditDescription = async (id: string) => {
    const newDescription = prompt('Enter new description:');
    if (newDescription) {
      const params = new URLSearchParams({ id, description: newDescription });
      updateFileMutation.mutate(params);
    }
  };

  const handleEditCategory = (id: string) => {
    const doc = filteredDocuments.find((d) => d.id === id);
    if (!doc) return;
    setCategoryEditDoc(doc);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (categoryId: string) => {
    if (!categoryEditDoc) return;
    const params = new URLSearchParams({ id: categoryEditDoc.id, cid: categoryId });
    updateFileMutation.mutate(params);
  };

  const handleDeleteFile = (id: string) => {
    deleteFileMutation.mutate(id);
  };

  const handleDownloadFile = (id: string) => {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = `${API_URL}/file?id=${id}&download=1`;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleFileClick = async (doc: FileRecord) => {
    try {
      addViewMutation.mutate(doc.id);
      navigate(`/file/${doc.id}`);
    } catch (error) {
      console.error('Error handling file click:', error);
    }
  };

  const handleShowInfo = (id: string) => {
    setInfoFileId(id);
    setShowInfoModal(true);
  };

  const getNameById = (id: string | number) => {
    const category = categories.find((item) => Number(item.id) === Number(id));
    return category ? category.name : String(id);
  };

  const getBorderColor = (initial: string) => letterColors[initial] || 'border-gray-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredDocuments.map((doc) => (
        <div key={doc.id} className="bg-white rounded-2xl shadow hover:shadow-md border border-gray-100 transition-all duration-200 overflow-hidden">
          <div className="p-4 flex flex-col gap-2 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0 cursor-pointer" onClick={() => handleFileClick(doc)}>
                <FaFilePdf className="text-red-500 text-xl flex-shrink-0" />
                <h3 className="ml-3 font-semibold text-gray-800 truncate max-w-[140px]">
                  {doc.title || 'Untitled Document'}
                </h3>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMenu(e, doc.id); }}
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
                  onClose={() => setActiveMenu(null)}
                />
              </div>
            </div>

            {doc.category_name && (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${getBorderColor(doc.category_name[0])} border-l-4`}>
                {doc.category_name}
              </span>
            )}
          </div>

          <div className="h-fix bg-gray-50 flex items-center justify-center cursor-pointer" onClick={() => handleFileClick(doc)}>
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

          <div className="p-4 cursor-pointer" onClick={() => handleFileClick(doc)}>
            <p className="text-sm text-gray-700 font-medium mb-1 line-clamp-2">
              {doc.shortDescription || doc.description || 'Untitled Document'}
            </p>
            <div className="text-xs text-gray-400">
              Uploaded: {doc.modified_at ? new Date(doc.modified_at).toLocaleString() : 'Date not available'}
            </div>
          </div>
        </div>
      ))}

      <ModalCategory
        isOpen={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setCategoryEditDoc(null); }}
        onSave={handleSaveCategory}
        initialCategory={categoryEditDoc ? String(categoryEditDoc.cid) : ''}
      />

      {selectedFile && (
        <PageViewer selectedFile={selectedFile} onClose={() => setSelectedFile(null)} />
      )}

      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-semibold text-gray-800">File Information</h4>
              <button onClick={() => { setShowInfoModal(false); setInfoFileId(null); }} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {infoData ? (
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
                  <span className="text-gray-800">{infoData.cid ? getNameById(infoData.cid) : 'Uncategorized'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="font-medium text-gray-600">Author:</span>
                  <span className="text-gray-800">{infoData.author || 'Unknown'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="font-medium text-gray-600">Modified at:</span>
                  <span className="text-gray-800">{infoData.modified_at ? new Date(infoData.modified_at).toLocaleString() : 'Unknown'}</span>
                </div>
                {infoData.history && infoData.history.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-600">View History:</span>
                    <div className="max-h-32 overflow-y-auto">
                      {infoData.history.map((date, index) => (
                        <div key={index} className="text-sm text-gray-600">{new Date(date).toLocaleString()}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileList;
