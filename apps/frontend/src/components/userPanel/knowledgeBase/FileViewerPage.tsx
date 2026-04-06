import { useQuery } from "@tanstack/react-query";
import { api, queryKeys } from "@www/api";
import { API_URL } from "@www/constant";
import * as pdfjsLib from "pdfjs-dist";
import { useState, useEffect } from "react";
import { FaFilePdf, FaDownload, FaArrowLeft, FaExternalLinkAlt } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function FileViewerPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const [fileContent, setFileContent] = useState<string[]>([]);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);

  const { data: fileInfo, isLoading } = useQuery({
    queryKey: queryKeys.fileInfo(fileId!),
    queryFn: () => api.file.getInfo(fileId!),
    enabled: Boolean(fileId),
  });

  useEffect(() => {
    if (!fileId) {
      return;
    }

    const loadPdf = async () => {
      try {
        setIsLoadingPdf(true);
        const response = await fetch(`${API_URL}/file?id=${fileId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch file content");
        }

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);
        const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;

        const { numPages } = pdfDoc;
        setTotalPages(numPages);
        const pages: string[] = [];

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 2 * zoom });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;
          pages.push(canvas.toDataURL("image/jpeg", 0.95));
        }

        setFileContent(pages);
      } catch (error) {
        console.error("Error loading PDF:", error);
        alert("Error loading PDF: " + (error as Error).message);
      } finally {
        setIsLoadingPdf(false);
      }
    };

    loadPdf();
  }, [fileId, zoom]);

  const handleDownload = async () => {
    if (!fileId) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/file?id=${fileId}&download=1`);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileInfo?.title || "document.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      alert("Error downloading file: " + (error as Error).message);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  const handleOpenInBrowser = () => {
    if (!fileId) {
      return;
    }
    window.open(`${API_URL}/file?id=${fileId}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <FaFilePdf className="text-xl text-red-500" />
                <h1 className="max-w-[200px] truncate text-lg font-semibold text-gray-900 sm:max-w-none">
                  {isLoading ? "Loading..." : fileInfo?.title || "Untitled"}
                </h1>
              </div>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-4">
              <button
                onClick={handleOpenInBrowser}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 hover:text-blue-700 sm:flex-none sm:px-4"
              >
                <FaExternalLinkAlt className="h-4 w-4" />
                <span className="hidden sm:inline">Open in Browser</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 hover:text-blue-700 sm:flex-none sm:px-4"
              >
                <FaDownload className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-200 p-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <button
                onClick={handleZoomOut}
                className="rounded-lg bg-gray-50 p-2 text-gray-600 hover:text-gray-900"
                disabled={zoom <= 0.5}
              >
                -
              </button>
              <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="rounded-lg bg-gray-50 p-2 text-gray-600 hover:text-gray-900"
                disabled={zoom >= 3}
              >
                +
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          <div className="p-4">
            {isLoadingPdf ? (
              <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {fileContent.map((page, index) => (
                  <div
                    key={index}
                    className="flex justify-center"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "top center",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <img
                      src={page}
                      alt={`Page ${index + 1}`}
                      className="h-auto max-w-full rounded shadow-lg"
                      onLoad={() => {
                        if (index === 0) {
                          setCurrentPage(1);
                        }
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
}

export default FileViewerPage;
