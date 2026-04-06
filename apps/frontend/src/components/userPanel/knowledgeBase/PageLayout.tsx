import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import Header from '@www/components/userPanel/knowledgeBase/Header';
import Body from '@www/components/userPanel/knowledgeBase/Body';
import { type FileRecord, type Document, queries } from '@www/api';

function PageLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filteredDocuments, setFilteredDocuments] = useState<FileRecord[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    ...queries.document(id!),
    enabled: !!id,
  });

  useEffect(() => {
    setFilteredDocuments(data?.files ?? []);
  }, [data]);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading document...</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mx-auto"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">Error fetching document</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mx-auto"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-gray-400 text-5xl mb-4">📄</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Document Not Found</h2>
            <p className="text-gray-600">The document you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mx-auto"
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
    <div className="bg-gray-50 min-h-screen">
      <Header toggleDropdown={toggleDropdown} dropdownOpen={dropdownOpen} />
      <div className="max-w-7xl mx-auto py-6 w-full">
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
