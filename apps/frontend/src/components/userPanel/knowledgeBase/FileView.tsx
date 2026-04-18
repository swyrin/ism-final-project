import { API_URL } from "@www/constant";
import { useState, useEffect, useRef } from "react";
import { FaFilePdf, FaSearchPlus, FaSearchMinus } from "react-icons/fa";

interface SelectedFile {
  id: string;
  title?: string;
}

interface FileViewProps {
  selectedFile: SelectedFile;
  fileContent: string[];
  onClose: () => void;
}

function FileView({ selectedFile, fileContent, onClose }: FileViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = fileContent.length;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      const pageElements = [...container.querySelectorAll(".pdf-page")];
      const viewportHeight = container.clientHeight;

      const visiblePageIndex = pageElements.findIndex((page) => {
        const { top, bottom } = page.getBoundingClientRect();
        const containerTop = container.getBoundingClientRect().top;
        return top - containerTop < viewportHeight / 2 && bottom - containerTop > 0;
      });

      if (visiblePageIndex !== -1) {
        setCurrentPage(visiblePageIndex + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [fileContent]);

  const handleDownload = () => {
    if (!selectedFile?.id) {
      return;
    }
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = `${API_URL}/file/${selectedFile.id}/raw?download=1`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="bg-opacity-70 absolute inset-0 bg-black" />
      <div className="relative flex h-full flex-col">
        <div className="bg-opacity-50 relative z-50 flex w-full items-center justify-between bg-black px-6 py-3 text-white">
          <div className="flex items-center gap-2 truncate">
            <FaFilePdf className="text-xl text-red-400" />
            <span className="truncate text-base font-medium">
              {(selectedFile.title || "Untitled Document") + ".pdf"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-2 transition hover:text-blue-300"
              aria-label="Download"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
            </button>
            <button onClick={onClose} className="transition hover:text-red-400" aria-label="Close">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="bg-opacity-50 relative flex-1 overflow-y-auto bg-black"
          onClick={(e) => e.stopPropagation()}
          ref={containerRef}
        >
          {fileContent.map((page, index) => (
            <div
              key={index}
              className="pdf-page mb-2 flex w-full justify-center last:mb-0"
              style={{ height: `${zoom * 91}vh` }}
            >
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                  transition: "transform 0.2s ease",
                }}
              >
                <img
                  src={page}
                  alt={`Page ${index + 1}`}
                  className="rounded object-contain shadow"
                  style={{ maxWidth: "100%", maxHeight: "90vh", display: "block" }}
                />
              </div>
            </div>
          ))}
        </div>

        <div
          className="bg-opacity-80 absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-4 rounded-full bg-black px-4 py-2 text-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 text-sm">
            <span className="px-3">Page</span>
            <span>{currentPage}</span>
            <span>/ {totalPages}</span>
          </div>
          <div className="mx-2 h-5 border-l border-white" />
          <div className="flex items-center gap-2">
            <button onClick={handleZoomOut} className="transition hover:text-gray-300">
              <FaSearchMinus />
            </button>
            <button onClick={handleZoomIn} className="transition hover:text-gray-300">
              <FaSearchPlus />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileView;
