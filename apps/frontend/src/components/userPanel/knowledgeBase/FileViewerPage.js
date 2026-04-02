import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaFilePdf, FaDownload, FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import { API_URL } from '../../../constant';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const FileViewerPage = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [fileInfo, setFileInfo] = useState(null);
  const [fileContent, setFileContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const fetchFileInfo = async () => {
      if (!fileId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/file?id=${fileId}&detail=1`);
        if (!response.ok) throw new Error('Failed to fetch file info');
        const data = await response.json();
        setFileInfo(data);
      } catch (error) {
        console.error('Error fetching file info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadPdf = async () => {
      if (!fileId) return;
      
      try {
        setIsLoadingPdf(true);
        const response = await fetch(`${API_URL}/file?id=${fileId}`);
        if (!response.ok) throw new Error('Failed to fetch file content');
        
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
        
        const numPages = pdfDoc.numPages;
        setTotalPages(numPages);
        const pages = [];
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 * zoom });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
          
          pages.push(canvas.toDataURL('image/jpeg', 0.95));
        }
        
        setFileContent(pages);
      } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF: ' + error.message);
      } finally {
        setIsLoadingPdf(false);
      }
    };

    fetchFileInfo();
    loadPdf();
  }, [fileId, zoom]);

  const handleDownload = async () => {
    if (!fileId) return;
    try {
      const response = await fetch(`${API_URL}/file?id=${fileId}&download=1`);
      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo?.title || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      alert('Error downloading file: ' + error.message);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

  const handleOpenInBrowser = () => {
    if (!fileId) return;
    window.open(`${API_URL}/file?id=${fileId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <FaFilePdf className="text-red-500 text-xl" />
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">
                  {fileInfo?.title || 'Loading...'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={handleOpenInBrowser}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <FaExternalLinkAlt className="w-4 h-4" />
                <span className="sm:hidden">Open</span>
                <span className="hidden sm:inline">Open in Browser</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <FaDownload className="w-4 h-4" />
                <span className="sm:hidden">Download</span>
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* PDF Controls */}
          <div className="border-b border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:text-gray-900 bg-gray-50 rounded-lg"
                disabled={zoom <= 0.5}
              >
                -
              </button>
              <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:text-gray-900 bg-gray-50 rounded-lg"
                disabled={zoom >= 3}
              >
                +
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* PDF Content */}
          <div className="p-4">
            {isLoadingPdf ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {fileContent.map((page, index) => (
                  <div
                    key={index}
                    className="flex justify-center"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <img
                      src={page}
                      alt={`Page ${index + 1}`}
                      className="shadow-lg rounded max-w-full h-auto"
                      onLoad={() => {
                        if (index === 0) setCurrentPage(1);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewerPage; 