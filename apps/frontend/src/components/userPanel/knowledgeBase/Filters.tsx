import { useState, ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaCalendarAlt, FaTag } from 'react-icons/fa';
import { api, queryKeys } from '../../../api';

interface FiltersProps {
  handleSearch: (category: string, sortOrder: string) => void;
}

function Filters({ handleSearch }: FiltersProps) {
  const [category, setCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.category.list,
  });

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    handleSearch(newCategory, sortOrder);
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = e.target.value;
    setSortOrder(newSortOrder);
    handleSearch(category, newSortOrder);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          {isLoading ? (
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
}

export default Filters;
