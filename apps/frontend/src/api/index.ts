import { API_URL } from '@www/constant';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface Document {
  id: string;
  title: string;
  modified_at: string;
  history?: string[];
  files?: FileRecord[];
}

export interface FileRecord {
  id: string;
  title: string;
  cid: string | number;
  author: string;
  description: string;
  did: string;
  view: number;
  category_name?: string;
  modified_at?: string;
  history?: string[];
  shortDescription?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category?: string;
  category_name?: string;
  cid?: string;
  author?: string;
  did?: string;
  modified_at?: string;
}

export interface HomeData {
  documents: Document[];
  total_views: number;
  total_files: number;
}

export const api = {
  home: {
    get: () => apiFetch<HomeData>('/home'),
  },

  document: {
    get: (id: string) => apiFetch<Document>(`/document?id=${id}`),
    create: (title: string) =>
      apiFetch<Document>('/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ title }).toString(),
      }),
    rename: (id: string, title: string) =>
      apiFetch<Document>('/document', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id, title }).toString(),
      }),
    delete: (id: string) =>
      apiFetch<{ message: string }>('/document', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id }).toString(),
      }),
  },

  file: {
    getInfo: (id: string) => apiFetch<FileRecord>(`/file?id=${id}&detail=1`),
    upload: (formData: FormData) =>
      apiFetch<FileRecord>('/file', { method: 'POST', body: formData }),
    update: (params: URLSearchParams) =>
      apiFetch<FileRecord>('/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }),
    delete: (id: string) =>
      apiFetch<{ message: string }>('/file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id }).toString(),
      }),
    addView: (id: string) =>
      apiFetch<FileRecord>('/file', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id }).toString(),
      }),
  },

  category: {
    list: () =>
      apiFetch<Category[]>('/category').then((cats) =>
        [...cats].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      ),
    create: (name: string) =>
      apiFetch<Category>('/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }),
    delete: (id: number) =>
      apiFetch<{ message: string }>('/category', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: String(id) }).toString(),
      }),
  },

  search: {
    query: (q: string) => apiFetch<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`),
  },
};

export const queryKeys = {
  home: ['home'] as const,
  document: (id: string) => ['document', id] as const,
  categories: ['categories'] as const,
  search: (q: string) => ['search', q] as const,
  fileInfo: (id: string) => ['file', id, 'info'] as const,
};

import { queryOptions } from '@tanstack/react-query';

export const queries = {
  home: () => queryOptions({
    queryKey: queryKeys.home,
    queryFn: api.home.get,
  }),
  document: (id: string) => queryOptions({
    queryKey: queryKeys.document(id),
    queryFn: () => api.document.get(id),
  }),
  categories: () => queryOptions({
    queryKey: queryKeys.categories,
    queryFn: api.category.list,
  }),
  search: (q: string) => queryOptions({
    queryKey: queryKeys.search(q),
    queryFn: () => api.search.query(q),
    enabled: !!q,
  }),
  fileInfo: (id: string) => queryOptions({
    queryKey: queryKeys.fileInfo(id),
    queryFn: () => api.file.getInfo(id),
    enabled: !!id,
  }),
};
