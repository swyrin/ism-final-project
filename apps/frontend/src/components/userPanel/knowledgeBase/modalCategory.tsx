import { useQuery } from "@tanstack/react-query";
import { queries } from "@www/api";
import { useState, useEffect } from "react";

interface ModalCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryId: string) => void;
  initialCategory?: string;
}

function ModalCategory({ isOpen, onClose, onSave, initialCategory }: ModalCategoryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "");

  const { data: categories = [] } = useQuery(queries.categories());

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    } else if (categories.length > 0) {
      setSelectedCategory(String(categories[0].id));
    }
  }, [initialCategory, categories, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="bg-opacity-30 fixed inset-0 z-50 flex items-start justify-center bg-black">
      <div className="relative mt-24 w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
          &times;
        </button>
        <h2 className="mb-4 text-lg font-semibold">Edit Category</h2>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
          <select
            className="w-full rounded border border-gray-300 p-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((option) => (
              <option key={option.id} value={String(option.id)}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
