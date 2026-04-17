import { queryOptions } from "@tanstack/react-query";
import { API_URL } from "@www/constant";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...init,
  });
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
  category_id: string | number;
  author: string;
  description: string;
  document_id: string;
  view: number;
  fileUrl?: string;
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
  category_id?: string;
  author?: string;
  document_id?: string;
  modified_at?: string;
}

export interface HomeData {
  documents: Document[];
  total_views: number;
  total_files: number;
}

export interface Share {
  id: string;
  shareUrl: string;
  createdAt: string;
}

export const api = {
  home: {
    get: () => apiFetch<HomeData>("/home"),
  },

  document: {
    get: (id: string) => apiFetch<Document>(`/document?id=${id}`),
    create: (title: string) =>
      apiFetch<Document>("/document", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ title }).toString(),
      }),
    rename: (id: string, title: string) =>
      apiFetch<Document>("/document", {
        method: "PUT",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id, title }).toString(),
      }),
    delete: (id: string) =>
      apiFetch<{ message: string }>("/document", {
        method: "DELETE",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id }).toString(),
      }),
  },

  file: {
    getInfo: (id: string) => apiFetch<FileRecord>(`/file/${id}`),
    upload: (formData: FormData) => apiFetch<FileRecord>("/file", { method: "POST", body: formData }),
    update: (id: string, params: URLSearchParams) =>
      apiFetch<FileRecord>(`/file/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }),
    delete: (id: string) => apiFetch<{ message: string }>(`/file/${id}`, { method: "DELETE" }),
    addView: (id: string) => apiFetch<FileRecord>(`/file/${id}`, { method: "PATCH" }),
    listShares: (id: string) => apiFetch<Share[]>(`/file/${id}/shares`),
    createShare: (id: string) => apiFetch<Share>(`/file/${id}/share`, { method: "POST" }),
  },

  share: {
    revoke: async (id: string): Promise<void> => {
      const res = await fetch(`${API_URL}/share/${id}/revoke`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `HTTP ${res.status}`);
      }
    },
  },

  category: {
    list: () =>
      apiFetch<Category[]>("/category").then((cats) =>
        [...cats].toSorted((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())),
      ),
    create: (name: string) =>
      apiFetch<Category>("/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
    delete: (id: number) =>
      apiFetch<{ message: string }>("/category", {
        method: "DELETE",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id: String(id) }).toString(),
      }),
  },

  search: {
    query: (q: string) => apiFetch<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`),
  },
};

export const queryKeys = {
  home: ["home"] as const,
  document: (id: string) => ["document", id] as const,
  categories: ["categories"] as const,
  search: (q: string) => ["search", q] as const,
  fileInfo: (id: string) => ["file", id, "info"] as const,
  shares: (fileId: string) => ["shares", fileId] as const,
};

export const queries = {
  home: () =>
    queryOptions({
      queryKey: queryKeys.home,
      queryFn: api.home.get,
    }),
  document: (id: string) =>
    queryOptions({
      queryKey: queryKeys.document(id),
      queryFn: () => api.document.get(id),
    }),
  categories: () =>
    queryOptions({
      queryKey: queryKeys.categories,
      queryFn: api.category.list,
    }),
  search: (q: string) =>
    queryOptions({
      queryKey: queryKeys.search(q),
      queryFn: () => api.search.query(q),
      enabled: Boolean(q),
    }),
  fileInfo: (id: string) =>
    queryOptions({
      queryKey: queryKeys.fileInfo(id),
      queryFn: () => api.file.getInfo(id),
      enabled: Boolean(id),
    }),
  shares: (fileId: string) =>
    queryOptions({
      queryKey: queryKeys.shares(fileId),
      queryFn: () => api.file.listShares(fileId),
      enabled: Boolean(fileId),
    }),
};

export const mutations = {
  document: {
    create: {
      mutationFn: (title: string) => api.document.create(title),
    },
    rename: {
      mutationFn: ({ id, title }: { id: string; title: string }) => api.document.rename(id, title),
    },
    delete: {
      mutationFn: (id: string) => api.document.delete(id),
    },
  },
  file: {
    upload: {
      mutationFn: (formData: FormData) => api.file.upload(formData),
    },
    update: {
      mutationFn: ({ id, params }: { id: string; params: URLSearchParams }) => api.file.update(id, params),
    },
    delete: {
      mutationFn: (id: string) => api.file.delete(id),
    },
    addView: {
      mutationFn: (id: string) => api.file.addView(id),
    },
    createShare: {
      mutationFn: (id: string) => api.file.createShare(id),
    },
  },
  share: {
    revoke: {
      mutationFn: (id: string) => api.share.revoke(id),
    },
  },
  category: {
    create: {
      mutationFn: (name: string) => api.category.create(name),
    },
    delete: {
      mutationFn: (id: number) => api.category.delete(id),
    },
  },
};
