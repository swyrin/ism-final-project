import { useState, Dispatch, SetStateAction, ChangeEvent, FormEvent } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys, FileRecord } from '@www/api';

interface AddFileButtonProps {
  setFilteredDocuments: Dispatch<SetStateAction<FileRecord[]>>;
  documentId: string;
}

interface FormData {
  title: string;
  content: string;
  category: string;
  author: string;
  file: File | null;
}

function AddFileButton({ setFilteredDocuments, documentId }: AddFileButtonProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    category: '',
    author: '',
    file: null,
  });
  const [error, setError] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');

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
      setCustomCategory('');
      setCategoryError('');
    },
    onError: (err) => {
      setCategoryError('Error creating category: ' + (err as Error).message);
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: (fd: FormData_) => api.file.upload(fd as unknown as globalThis.FormData),
    onSuccess: (newFile) => {
      setFilteredDocuments((prev) => [...prev, newFile]);
      setShowForm(false);
      setFormData({ title: '', content: '', category: '', author: '', file: null });
      setError('');
    },
    onError: (err) => {
      setError('Error uploading file: ' + (err as Error).message);
    },
  });

  // Use a type alias to avoid shadowing
  type FormData_ = typeof formData;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'category' && value === 'other') {
      setShowCategoryModal(true);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.category || !formData.author.trim() || !formData.file) {
      setError('All fields are required and a PDF file must be selected.');
      return;
    }

    const fd = new globalThis.FormData();
    fd.append('title', formData.title);
    fd.append('cid', formData.category);
    fd.append('author', formData.author);
    fd.append('did', documentId);
    fd.append('description', formData.content);
    fd.append('attachment', formData.file);

    uploadFileMutation.mutate(fd as unknown as FormData_);
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
              <button type="button" onClick={handleCancelFile} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm sm:text-base text-gray-500 mb-4">Fill in all fields and upload a PDF file.</p>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input id="title" name="title" type="text" value={formData.title} onChange={handleChange}
                className="block w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter title..." required maxLength={100} />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="content" name="content" rows={4} value={formData.content} onChange={handleChange}
                className="block w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write a brief description..." required maxLength={500} />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange}
                className="block w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                required>
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
                <option value="other">+</option>
              </select>
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input id="author" name="author" type="text" value={formData.author} onChange={handleChange}
                className="block w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Author name..." required maxLength={100} />
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">Upload PDF File</label>
              <input id="file" name="file" type="file" onChange={handleFileChange}
                className="block w-full text-sm sm:text-base border border-gray-300 rounded-lg px-3 sm:px-4 py-2 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-blue-600 file:text-white file:cursor-pointer file:text-sm"
                accept="application/pdf" required />
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button type="button" onClick={handleCancelFile}
                className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm sm:text-base">
                Cancel
              </button>
              <button type="submit" disabled={uploadFileMutation.isPending}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow text-sm sm:text-base disabled:opacity-50">
                {uploadFileMutation.isPending ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
              <button onClick={() => { setShowCategoryModal(false); setCustomCategory(''); setCategoryError(''); }} className="text-gray-400 hover:text-gray-500">
                <FaTimes />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input type="text" id="customCategory" value={customCategory}
                onChange={(e) => { setCustomCategory(e.target.value); setCategoryError(''); }}
                className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name" />
              {categoryError && <p className="mt-1 text-sm text-red-500">{categoryError}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setShowCategoryModal(false); setCustomCategory(''); setCategoryError(''); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                Cancel
              </button>
              <button
                onClick={() => { if (!customCategory.trim()) { setCategoryError('Please enter a category name'); return; } createCategoryMutation.mutate(customCategory); }}
                disabled={createCategoryMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow disabled:opacity-50">
                {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddFileButton;
