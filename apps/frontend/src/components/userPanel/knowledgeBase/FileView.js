import React, { useState, useEffect, useRef } from 'react';
import { FaFilePdf, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import { API_URL } from '../../../constant';

const FileView = ({ selectedFile, fileContent, onClose }) => {
    const containerRef = useRef(null);
    const [zoom, setZoom] = useState(1); // Scale multiplier
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = fileContent.length;

    // Handle zoom in/out
    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

    // Handle scroll tracking
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const pageElements = Array.from(container.querySelectorAll('.pdf-page'));
            const viewportHeight = container.clientHeight;

            const visiblePageIndex = pageElements.findIndex((page) => {
                const { top, bottom } = page.getBoundingClientRect();
                const containerTop = container.getBoundingClientRect().top;
                return top - containerTop < viewportHeight / 2 && bottom - containerTop > 0;
            });

            if (visiblePageIndex >= 0) {
                setCurrentPage(visiblePageIndex + 1);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [fileContent]);

    // Download handler
    const handleDownload = () => {
        if (!selectedFile?.id) return;
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = `${API_URL}/file?id=${selectedFile.id}&download=1`;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black bg-opacity-70"
            />
            {/* Modal Content */}
            <div className="relative flex flex-col h-full">
                {/* Header */}
                <div className="w-full px-6 py-3 flex items-center justify-between bg-black bg-opacity-50 text-white z-50 relative">
                    <div className="flex items-center gap-2 truncate">
                        <FaFilePdf className="text-red-400 text-xl" />
                        <span className="text-base font-medium truncate">
                            {selectedFile.title + '.pdf' || 'Untitled Document'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleDownload} className="hover:text-blue-300 transition px-2" aria-label="Download">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                            </svg>
                        </button>
                        <button onClick={onClose} className="hover:text-red-400 transition" aria-label="Close">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                {/* Scrollable Content */}
                <div
                    className="flex-1 relative bg-black bg-opacity-50 overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                    ref={containerRef}
                >
                    {fileContent.map((page, index) => (
                        <div
                            key={index}
                            className="pdf-page w-full flex justify-center mb-2 last:mb-0"
                            style={{ height: `${zoom * 91}vh` }}
                        >
                            <div
                                style={{
                                    transform: `scale(${zoom})`,
                                    transformOrigin: 'top center',
                                    transition: 'transform 0.2s ease',
                                }}
                            >
                                <img
                                    src={page}
                                    alt={`Page ${index + 1}`}
                                    className="object-contain shadow rounded "
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '90vh',
                                        display: 'block',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                {/* Bottom Control Panel */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-full flex items-center gap-4 shadow-lg z-50" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 text-sm">
                        <span className='px-3'>Page</span>
                        <span>{currentPage}</span>
                        <span>/ {totalPages}</span>
                    </div>
                    <div className="h-5 border-l border-white mx-2"></div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleZoomOut} className="hover:text-gray-300 transition">
                            <FaSearchMinus />
                        </button>
                        <button onClick={handleZoomIn} className="hover:text-gray-300 transition">
                            <FaSearchPlus />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileView;