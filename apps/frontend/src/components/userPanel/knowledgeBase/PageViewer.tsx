import { useState, useEffect } from 'react';
import { FaFilePdf, FaDownload, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { API_URL } from '@www/constant';
import FileView from '@www/components/userPanel/knowledgeBase/FileView';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface SelectedFile {
  id: string;
  title?: string;
}

interface FileInfo {
  title?: string;
  description?: string;
  author?: string;
  category_name?: string;
  created_at?: string;
  modified_at?: string;
  view?: number;
}

interface PageViewerProps {
  selectedFile: SelectedFile | null;
  onClose: () => void;
}

function PageViewer({ selectedFile, onClose }: PageViewerProps) {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [fileContent, setFileContent] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFileView, setShowFileView] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  useEffect(() => {
    const fetchFileInfo = async () => {
      if (!selectedFile?.id) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/file?id=${selectedFile.id}&detail=1`);
        if (!response.ok) throw new Error('Failed to fetch file info');
        const data = await response.json();
        setFileInfo(data);
      } catch (error) {
        console.error('Error fetching file info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileInfo();
  }, [selectedFile]);

  const handleOpenFileView = async () => {
    if (!selectedFile?.id) return;

    try {
      setIsLoadingPdf(true);
      const response = await fetch(`${API_URL}/file?id=${selectedFile.id}`);
      if (!response.ok) throw new Error('Failed to fetch file content');

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;

      const numPages = pdfDoc.numPages;
      const pages: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        pages.push(canvas.toDataURL('image/jpeg', 0.95));
      }

      setFileContent(pages);
      setShowFileView(true);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF: ' + (error as Error).message);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFile?.id) return;
    try {
      const response = await fetch(`${API_URL}/file?id=${selectedFile.id}&download=1`);
      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.title || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      alert('Error downloading file: ' + (error as Error).message);
    }
  };

  if (!selectedFile) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose} />

      <div className="relative flex flex-col h-full max-w-6xl mx-auto bg-white">
        <div className="w-full px-6 py-3 flex items-center justify-between bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 truncate">
            <FaFilePdf className="text-red-400 text-xl" />
            <span className="text-base font-medium truncate">
              {selectedFile.title || 'Untitled Document'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="hover:text-blue-500 transition px-2" aria-label="Download">
              <FaDownload className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="hover:text-red-500 transition" aria-label="Close">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-12 h-full">
            <div className="col-span-3 border-r border-gray-200 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                File Information
              </h3>

              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : fileInfo ? (
                <div className="space-y-4">
                  <div><label className="text-sm text-gray-500">Title</label><p className="font-medium">{fileInfo.title || 'Untitled'}</p></div>
                  <div><label className="text-sm text-gray-500">Description</label><p className="font-medium">{fileInfo.description || 'No description'}</p></div>
                  <div><label className="text-sm text-gray-500">Author</label><p className="font-medium">{fileInfo.author || 'Unknown'}</p></div>
                  <div><label className="text-sm text-gray-500">Category</label><p className="font-medium">{fileInfo.category_name || 'Uncategorized'}</p></div>
                  <div><label className="text-sm text-gray-500">Last Modified</label><p className="font-medium">{fileInfo.modified_at ? new Date(fileInfo.modified_at).toLocaleString() : 'Unknown'}</p></div>
                  <div><label className="text-sm text-gray-500">Views</label><p className="font-medium">{fileInfo.view || 0}</p></div>
                </div>
              ) : (
                <p className="text-gray-500">Failed to load file information</p>
              )}
            </div>

            <div className="col-span-9 bg-gray-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-sm p-4 h-full">
                <div className="flex justify-center items-center h-full">
                  <button
                    onClick={handleOpenFileView}
                    disabled={isLoadingPdf}
                    className={`flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg transition-colors ${
                      isLoadingPdf
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {isLoadingPdf ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="text-gray-600 font-medium">Loading PDF...</span>
                      </>
                    ) : (
                      <>
                        <FaFilePdf className="text-red-500 text-4xl" />
                        <span className="text-gray-600 font-medium">Click to view PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFileView && (
        <FileView
          selectedFile={selectedFile}
          fileContent={fileContent}
          onClose={() => setShowFileView(false)}
        />
      )}
    </div>
  );
}

export default PageViewer;
