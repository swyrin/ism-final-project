import type { ChangeEvent, FormEvent } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@www/api";
import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

interface AddFileButtonProps {
  documentId: string;
}

interface FormData {
  title: string;
  content: string;
  category: string;
  author: string;
  file: File | null;
}

function AddFileButton({ documentId }: AddFileButtonProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    category: "",
    author: "",
    file: null,
  });
  const [error, setError] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.category.list,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => api.category.create(name),
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      setFormData((prev) => ({ ...prev, category: String(newCategory.id) }));
      setShowCategoryModal(false);
      setCustomCategory("");
      setCategoryError("");
    },
    onError: (err) => {
      setCategoryError("Error creating category: " + (err as Error).message);
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: (fd: FormData_) => api.file.upload(fd as unknown as globalThis.FormData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.document(documentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.home });
      setShowForm(false);
      setFormData({ title: "", content: "", category: "", author: "", file: null });
      setError("");
    },
    onError: (err) => {
      setError("Error uploading file: " + (err as Error).message);
    },
  });

  // Use a type alias to avoid shadowing
  type FormData_ = typeof formData;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "category" && value === "other") {
      setShowCategoryModal(true);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError("");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.category ||
      !formData.author.trim() ||
      !formData.file
    ) {
      setError("All fields are required and a PDF file must be selected.");
      return;
    }

    const fd = new globalThis.FormData();
    fd.append("title", formData.title);
    fd.append("category_id", formData.category);
    fd.append("author", formData.author);
    fd.append("document_id", documentId);
    fd.append("description", formData.content);
    fd.append("attachment", formData.file);

    uploadFileMutation.mutate(fd as unknown as FormData_);
  };

  const handleCancelFile = () => {
    setShowForm(false);
    setFormData({ title: "", content: "", category: "", author: "", file: null });
    setError("");
  };

  return (
    <div>
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 rounded-lg bg-green-600 p-2 text-white transition hover:bg-green-700"
      >
        <FaPlus /> Add a New File
      </button>

      {showForm && (
        <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center bg-black p-4 backdrop-blur-sm transition-all">
          <form
            onSubmit={handleSubmit}
            className="animate-fadeIn relative max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:space-y-6 sm:p-8"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">Add New File</h2>
              <button type="button" onClick={handleCancelFile} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-500 sm:text-base">
              Fill in all fields and upload a PDF file.
            </p>

            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none sm:px-4 sm:text-base"
                placeholder="Enter title..."
                required={true}
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="content"
                name="content"
                rows={4}
                value={formData.content}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none sm:px-4 sm:text-base"
                placeholder="Write a brief description..."
                required={true}
                maxLength={500}
              />
            </div>

            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none sm:px-4 sm:text-base"
                required={true}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
                <option value="other">+</option>
              </select>
            </div>

            <div>
              <label htmlFor="author" className="mb-1 block text-sm font-medium text-gray-700">
                Author
              </label>
              <input
                id="author"
                name="author"
                type="text"
                value={formData.author}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none sm:px-4 sm:text-base"
                placeholder="Author name..."
                required={true}
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="file" className="mb-1 block text-sm font-medium text-gray-700">
                Upload PDF File
              </label>
              <input
                id="file"
                name="file"
                type="file"
                onChange={handleFileChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:text-white sm:px-4 sm:text-base"
                accept="application/pdf"
                required={true}
              />
            </div>

            {error && <div className="text-center text-sm text-red-500">{error}</div>}

            <div className="flex flex-col justify-end gap-3 pt-4 sm:flex-row">
              <button
                type="button"
                onClick={handleCancelFile}
                className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200 sm:w-auto sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadFileMutation.isPending}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50 sm:w-auto sm:text-base"
              >
                {uploadFileMutation.isPending ? "Uploading..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showCategoryModal && (
        <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setCustomCategory("");
                  setCategoryError("");
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="customCategory" className="mb-1 block text-sm font-medium text-gray-700">
                Category Name
              </label>
              <input
                type="text"
                id="customCategory"
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value);
                  setCategoryError("");
                }}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter category name"
              />
              {categoryError && <p className="mt-1 text-sm text-red-500">{categoryError}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setCustomCategory("");
                  setCategoryError("");
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!customCategory.trim()) {
                    setCategoryError("Please enter a category name");
                    return;
                  }
                  createCategoryMutation.mutate(customCategory);
                }}
                disabled={createCategoryMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
              >
                {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddFileButton;
