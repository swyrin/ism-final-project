// src/components/knowledgeBase/PageLayout.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa';
import Header from './Header';
import Body from './Body';
import { API_URL } from '../../../constant';

const PageLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [fileName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        setError('');
        if (!id) {
          setError('No document ID provided');
          return;
        }
        const response = await fetch(`${API_URL}/document?id=${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!data || !data.id) {
          setError('Document not found');
          setDocument(null);
          setFilteredDocuments([]);
        } else {
          setDocument(data);
          setFilteredDocuments(data.files || []);
        }
      } catch (error) {
        setError('Error fetching document');
        setDocument(null);
        setFilteredDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchDocument();
  }, [id]);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
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

  if (!document) {
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
      {/* Header */}
      <Header toggleDropdown={toggleDropdown} dropdownOpen={dropdownOpen} />
      {/* Body */}
      <div className="max-w-7xl mx-auto py-6 w-full">
        <Body 
          filteredDocuments={filteredDocuments} 
          setFilteredDocuments={setFilteredDocuments}
          documentId={id}
          document={document}
        />
      </div>
    </div>
  );
};

export default PageLayout;