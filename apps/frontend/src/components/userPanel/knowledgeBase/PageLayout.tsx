import { useQuery } from "@tanstack/react-query";
import { type FileRecord, type Document, queries } from "@www/api";
import Body from "@www/components/userPanel/knowledgeBase/Body";
import Header from "@www/components/userPanel/knowledgeBase/Header";
import { useEffect, useState } from "react";
import { FaSpinner, FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

function PageLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filteredDocuments, setFilteredDocuments] = useState<FileRecord[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    ...queries.document(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    setFilteredDocuments(data?.files ?? []);
  }, [data]);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="mx-auto mb-4 animate-spin text-4xl text-blue-600" />
          <p className="text-gray-600">Loading document...</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mx-auto mt-4 flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <div className="text-center">
            <div className="mb-4 text-5xl text-red-500">⚠️</div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-800">Error</h2>
            <p className="text-gray-600">Error fetching document</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mx-auto mt-4 flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <div className="text-center">
            <div className="mb-4 text-5xl text-gray-400">📄</div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-800">Document Not Found</h2>
            <p className="text-gray-600">
              The document you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mx-auto mt-4 flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header toggleDropdown={toggleDropdown} dropdownOpen={dropdownOpen} />
      <div className="mx-auto w-full max-w-7xl py-6">
        <Body
          filteredDocuments={filteredDocuments}
          setFilteredDocuments={setFilteredDocuments}
          documentId={id!}
          document={data as Document}
        />
      </div>
    </div>
  );
}

export default PageLayout;
