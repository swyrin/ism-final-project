import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@www/api';

interface ModalCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryId: string) => void;
  initialCategory?: string;
}

function ModalCategory({ isOpen, onClose, onSave, initialCategory }: ModalCategoryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');

  const { data: categories = [] } = useQuery(queries.categories());

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    } else if (categories.length > 0) {
      setSelectedCategory(String(categories[0].id));
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
              <option key={option.id} value={String(option.id)}>{option.name}</option>
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
}

export default ModalCategory;
