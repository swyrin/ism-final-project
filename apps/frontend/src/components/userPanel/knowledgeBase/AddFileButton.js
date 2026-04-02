import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { API_URL } from '../../../constant';

const AddFiletButton = ({ setFilteredDocuments, documentId }) => {
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    author: '',
    file: null,
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/category`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        // Sort categories alphabetically by name (case-insensitive)
        const sortedCategories = [...data].sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase()));
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category' && value === 'other') {
      setShowCategoryModal(true);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleCustomCategoryChange = (e) => {
    setCustomCategory(e.target.value);
    setCategoryError('');
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!customCategory.trim()) {
      setCategoryError('Please enter a category name');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: customCategory }),
      });
      
      if (!response.ok) throw new Error('Failed to create category');
      const newCategory = await response.json();
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({
        ...prev,
        category: newCategory.id
      }));
      setShowCategoryModal(false);
      setCustomCategory('');
      setCategoryError('');
    } catch (error) {
      setCategoryError('Error creating category: ' + error.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      file: file,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (!formData.title.trim() || !formData.content.trim() || !formData.category || !formData.author.trim() || !formData.file) {
      setError('All fields are required and a PDF file must be selected.');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('cid', formData.category);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('did', documentId);
      formDataToSend.append('description', formData.content);
      if (formData.file) {
        formDataToSend.append('attachment', formData.file);
      }

      const response = await fetch(`${API_URL}/file`, {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) throw new Error('Failed to upload file');
      const newFile = await response.json();
      setFilteredDocuments((prevDocs) => [...prevDocs, newFile]);
      console.log(newFile);
      setShowForm(false);
      setFormData({ title: '', content: '', category: '', author: '', file: null });
      setError('');
    } catch (error) {
      setError('Error uploading file: ' + error.message);
    }
  };

  const handleCancelFile = () => {
    setShowForm(false);
    setFormData({ title: '', content: '', category: '', author: '', file: null });
    setError('');
  };

  return (
    <div>
      <button
        onClick={() => setShowForm(true)}
        className="p-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
      >
        <FaPlus /> Add a New File
      </button>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm transition-all p-4">
          <form
            onSubmit={handleSubmit}
            className="relative bg-white p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-xl space-y-4 sm:space-y-6 animate-fadeIn max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Add New File</h2>
              <button
                type="button"
                onClick={handleCancelFile}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm sm:text-base text-gray-500 mb-4">Fill in all fields and upload a PDF file to add a new document to this knowledge base.</p>
            
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter title..."
                required
                maxLength={100}
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="content"
                name="content"
                rows="4"
                value={formData.content}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write a brief description..."
                required
                maxLength={500}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
                <option value="other">+</option>
              </select>
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                id="author"
                name="author"
                type="text"
                value={formData.author}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Author name..."
                required
                maxLength={100}
              />
            </div>

            {/* File */}
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">Upload PDF File</label>
              <input
                id="file"
                name="file"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm sm:text-base border border-gray-300 rounded-lg px-3 sm:px-4 py-2 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-blue-600 file:text-white file:cursor-pointer file:text-sm"
                accept="application/pdf"
                required
              />
            </div>

            {/* Error */}
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancelFile}
                className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow text-sm sm:text-base"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setCustomCategory('');
                  setCategoryError('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitCategory}>
              <div className="mb-4">
                <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  id="customCategory"
                  value={customCategory}
                  onChange={handleCustomCategoryChange}
                  className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                  required
                />
                {categoryError && (
                  <p className="mt-1 text-sm text-red-500">{categoryError}</p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setCustomCategory('');
                    setCategoryError('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFiletButton;