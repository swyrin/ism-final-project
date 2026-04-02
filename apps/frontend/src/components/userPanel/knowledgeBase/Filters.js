import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaTag } from 'react-icons/fa';
import { API_URL } from '../../../constant';

const Filters = ({ handleSearch }) => {
  // State để quản lý bộ lọc
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest');

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
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Hàm xử lý thay đổi bộ lọc
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    handleSearch(newCategory, sortOrder);
  };

  const handleSortChange = (e) => {
    const newSortOrder = e.target.value;
    setSortOrder(newSortOrder);
    handleSearch(category, newSortOrder);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Category Filter */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <FaTag className="mr-2 text-gray-400" />
          Category
        </label>
        <select
          value={category}
          onChange={handleCategoryChange}
          className="block w-full pl-3 pr-10 py-2 text-sm md:text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
        >
          <option value="all">All Categories</option>
          {loading ? (
            <option value="" disabled>Loading categories...</option>
          ) : (
            categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Sort Order */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <FaCalendarAlt className="mr-2 text-gray-400" />
          Sort By
        </label>
        <select
          value={sortOrder}
          onChange={handleSortChange}
          className="block w-full pl-3 pr-10 py-2 text-sm md:text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;