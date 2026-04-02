import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../constant';

const ModalCategory = ({ isOpen, onClose, onSave, initialCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/category`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        // Sort categories alphabetically by name (case-insensitive)
        const sortedCategories = [...data].sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase()));
        setCategories(sortedCategories);
        if (!initialCategory && sortedCategories.length > 0) {
          setSelectedCategory(sortedCategories[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    } else if (categories.length > 0) {
      setSelectedCategory(categories[0].id);
    }
  }, [initialCategory, categories, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-30">
      <div className="bg-white mt-24 rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold mb-4">Edit Category</h2>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => onSave(selectedCategory)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCategory;
