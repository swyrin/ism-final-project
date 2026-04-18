import FileView from "@www/components/userPanel/knowledgeBase/FileView";
import { API_URL } from "@www/constant";
import * as pdfjsLib from "pdfjs-dist";
import { useState, useEffect } from "react";
import { FaFilePdf, FaDownload, FaTimes, FaInfoCircle } from "react-icons/fa";

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
      if (!selectedFile?.id) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/file/${selectedFile.id}`, { credentials: "include" });
        if (!response.ok) {
          throw new Error("Failed to fetch file info");
        }
        const data = await response.json();
        setFileInfo(data);
      } catch (error) {
        console.error("Error fetching file info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileInfo();
  }, [selectedFile]);

  const handleOpenFileView = async () => {
    if (!selectedFile?.id) {
      return;
    }

    try {
      setIsLoadingPdf(true);
      const response = await fetch(`${API_URL}/file/${selectedFile.id}/raw`, { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to fetch file content");
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;

      const { numPages } = pdfDoc;
      const pages: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        pages.push(canvas.toDataURL("image/jpeg", 0.95));
      }

      setFileContent(pages);
      setShowFileView(true);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Error loading PDF: " + (error as Error).message);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFile?.id) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/file/${selectedFile.id}/raw?download=1`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedFile.title || "document.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      alert("Error downloading file: " + (error as Error).message);
    }
  };

  if (!selectedFile) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="bg-opacity-70 absolute inset-0 bg-black" onClick={onClose} />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col bg-white">
        <div className="flex w-full items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex items-center gap-2 truncate">
            <FaFilePdf className="text-xl text-red-400" />
            <span className="truncate text-base font-medium">
              {selectedFile.title || "Untitled Document"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-2 transition hover:text-blue-500"
              aria-label="Download"
            >
              <FaDownload className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="transition hover:text-red-500" aria-label="Close">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-12">
            <div className="col-span-3 overflow-y-auto border-r border-gray-200 p-4">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <FaInfoCircle className="text-blue-500" />
                File Information
              </h3>

              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
                </div>
              ) : fileInfo ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Title</label>
                    <p className="font-medium">{fileInfo.title || "Untitled"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Description</label>
                    <p className="font-medium">{fileInfo.description || "No description"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Author</label>
                    <p className="font-medium">{fileInfo.author || "Unknown"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Category</label>
                    <p className="font-medium">{fileInfo.category_name || "Uncategorized"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Last Modified</label>
                    <p className="font-medium">
                      {fileInfo.modified_at ? new Date(fileInfo.modified_at).toLocaleString() : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Views</label>
                    <p className="font-medium">{fileInfo.view || 0}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Failed to load file information</p>
              )}
            </div>

            <div className="col-span-9 overflow-y-auto bg-gray-50 p-4">
              <div className="h-full rounded-lg bg-white p-4 shadow-sm">
                <div className="flex h-full items-center justify-center">
                  <button
                    onClick={handleOpenFileView}
                    disabled={isLoadingPdf}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
                      isLoadingPdf
                        ? "cursor-not-allowed border-gray-300 bg-gray-50"
                        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    {isLoadingPdf ? (
                      <>
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
                        <span className="font-medium text-gray-600">Loading PDF...</span>
                      </>
                    ) : (
                      <>
                        <FaFilePdf className="text-4xl text-red-500" />
                        <span className="font-medium text-gray-600">Click to view PDF</span>
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
