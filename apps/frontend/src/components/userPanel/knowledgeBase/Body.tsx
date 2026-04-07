import type { FileRecord, Document } from "@www/api";
import type { Dispatch, SetStateAction } from "react";

import AddFileButton from "@www/components/userPanel/knowledgeBase/AddFileButton";
import FileList from "@www/components/userPanel/knowledgeBase/FileList";
import Filters from "@www/components/userPanel/knowledgeBase/Filters";
import { useState, useEffect } from "react";
import { FaFilter, FaSort } from "react-icons/fa";

interface BodyProps {
  filteredDocuments: FileRecord[];
  setFilteredDocuments: Dispatch<SetStateAction<FileRecord[]>>;
  documentId: string;
  document: Document;
}

function Body({ filteredDocuments, setFilteredDocuments, documentId, document }: BodyProps) {
  const [originalDocuments, setOriginalDocuments] = useState<FileRecord[]>([]);
  const [currentFiltered, setCurrentFiltered] = useState<FileRecord[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setOriginalDocuments(document.files || []);
    setCurrentFiltered(filteredDocuments);
  }, [filteredDocuments, document.files]);

  const handleSearch = (category: string, sortOrder: string) => {
    let filtered = [...originalDocuments];

    if (category !== "all") {
      filtered = filtered.filter((doc) => String(doc.category_id) === String(category));
    }

    const sorted = filtered.toSorted((a, b) => {
      const dateA = new Date(a.modified_at || 0).getTime();
      const dateB = new Date(b.modified_at || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setCurrentFiltered(sorted);
  };

  return (
    <div className="w-full px-4 md:px-6">
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <h2 className="text-lg font-semibold text-gray-800 md:text-xl">{document.title}</h2>
            <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              {currentFiltered.length} files
            </span>
          </div>
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:w-auto md:px-4"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
            <AddFileButton setFilteredDocuments={setFilteredDocuments} documentId={documentId} />
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3 shadow-sm md:p-4">
            <Filters handleSearch={handleSearch} />
          </div>
        )}
      </div>

      <div className="flex min-h-screen flex-col bg-gray-50">
        <div className="flex w-full flex-1 flex-col py-4 md:py-6">
          <div className="flex w-full flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 md:px-6 md:py-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Files</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <FaSort className="mr-2" />
                  <span>Sorted by date</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 md:px-6 md:py-4">
              <FileList
                filteredDocuments={currentFiltered}
                setFilteredDocuments={setFilteredDocuments}
                documentId={documentId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Body;
