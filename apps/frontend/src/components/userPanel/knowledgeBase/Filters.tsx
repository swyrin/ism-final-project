import type { ChangeEvent } from "react";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FaCalendarAlt, FaTag } from "react-icons/fa";

import { api, queryKeys } from "../../../api";

interface FiltersProps {
  handleSearch: (category: string, sortOrder: string) => void;
}

function Filters({ handleSearch }: FiltersProps) {
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <FaTag className="mr-2 text-gray-400" />
          Category
        </label>
        <select
          value={category}
          onChange={handleCategoryChange}
          className="block w-full rounded-md border-gray-300 bg-white py-2 pr-10 pl-3 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none md:text-base"
        >
          <option value="all">All Categories</option>
          {isLoading ? (
            <option value="" disabled={true}>
              Loading categories...
            </option>
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
          className="block w-full rounded-md border-gray-300 bg-white py-2 pr-10 pl-3 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none md:text-base"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );
}

export default Filters;
