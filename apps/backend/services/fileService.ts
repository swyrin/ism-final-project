import * as minioService from "@srv/infra/storage/minioService";
import * as categoryRepository from "@srv/repository/categoryRepository";
import * as documentRepository from "@srv/repository/documentRepository";
import * as fileRepository from "@srv/repository/fileRepository";
import { BadRequestError, NotFoundError } from "@srv/utils/HttpError";

function formatFile(file: {
  id: string;
  title: string;
  category_id: number;
  author: string;
  description: string;
  document_id: string;
  view: number;
  storagePath: string;
  category?: { name: string };
  history: { file_id: string; modified_at: Date }[];
}) {
  const sortedHistory = [...file.history].sort((a, b) => b.modified_at.getTime() - a.modified_at.getTime());
  return {
    id: file.id,
    title: file.title,
    category_id: file.category_id,
    author: file.author,
    description: file.description,
    document_id: file.document_id,
    view: file.view,
    ...(file.category && { category_name: file.category.name }),
    modified_at: sortedHistory[0]?.modified_at.toISOString(),
    history: sortedHistory.map((h) => h.modified_at.toISOString()),
  };
}

function fileSummary(file: {
  id: string;
  title: string;
  storagePath: string;
  history: { file_id: string; modified_at: Date }[];
}) {
  const sortedHistory = [...file.history].sort((a, b) => b.modified_at.getTime() - a.modified_at.getTime());
  return {
    id: file.id,
    title: file.title,
    modified_at: sortedHistory[0]?.modified_at.toISOString(),
    fileUrl: minioService.buildFileUrl(file.storagePath),
  };
}

export const createFile = async (
  user_id: string,
  body: Record<string, unknown>,
  buffer: Buffer,
  contentType: string,
): Promise<ReturnType<typeof formatFile>> => {
  const { title, category_id, author, document_id, description } = body as {
    title?: string;
    category_id?: string;
    author?: string;
    document_id?: string;
    description?: string;
  };

  if (!(title && category_id && author && document_id && description)) {
    throw new BadRequestError("missing parameter.");
  }

  const fileId = await fileRepository.generateFileId();

  const category = await categoryRepository.getCategoryById(category_id);
  if (!category) {
    throw new NotFoundError("category not found.");
  }

  const document = await documentRepository.getDocumentById(document_id);
  if (!document) {
    throw new NotFoundError("document not found.");
  }

  const storageKey = `${fileId}.pdf`;
  await minioService.uploadFile(storageKey, buffer, contentType);

  let file;
  try {
    file = await fileRepository.createFile(user_id, fileId, {
      title,
      category_id,
      author,
      description,
      document_id,
      storageKey,
    });
  } catch (error) {
    await minioService.deleteFile(storageKey);
    throw error;
  }

  return formatFile(file);
};

export const editFileInformation = async (
  user_id: string,
  id: string,
  body: Record<string, unknown>,
): Promise<ReturnType<typeof formatFile>> => {
  const { title, category_id, description } = body as {
    title?: string;
    category_id?: string;
    description?: string;
  };

  if (!title && !category_id && !description) {
    throw new BadRequestError("missing parameter.");
  }

  const fileExists = await fileRepository.isFileExist(user_id, id);
  if (!fileExists) {
    throw new NotFoundError("file not found.");
  }

  if (category_id) {
    const category = await categoryRepository.getCategoryById(category_id);
    if (!category) {
      throw new NotFoundError("category not found.");
    }
  }

  const file = await fileRepository.editFileInformation(user_id, id, {
    category_id,
    title,
    description,
  });
  return formatFile(file);
};

export const getFileInformation = async (
  user_id: string,
  id: string,
): Promise<ReturnType<typeof formatFile> & { fileUrl: string }> => {
  const file = await fileRepository.getFileInformation(user_id, id);

  if (!file) {
    throw new NotFoundError("file not found.");
  }

  return {
    ...formatFile(file),
    fileUrl: minioService.buildFileUrl(file.storagePath),
  };
};

export const deleteFile = async (user_id: string, id: string): Promise<{ message: string }> => {
  const file = await fileRepository.getFileInformation(user_id, id);

  if (!file) {
    throw new NotFoundError("file not found.");
  }

  await fileRepository.deleteFile(user_id, id);
  await minioService.deleteFile(file.storagePath);

  return { message: "delete successfully." };
};

export const getFilesByDocumentId = async (
  user_id: string,
  document_id: string,
  category_id?: string,
): Promise<ReturnType<typeof fileSummary>[]> => {
  const files = await fileRepository.getFilesByDocumentId(user_id, document_id, category_id);
  return files.map(fileSummary);
};

export const addView = async (user_id: string, id: string): Promise<ReturnType<typeof formatFile>> => {
  const existing = await fileRepository.isFileExist(user_id, id);
  if (!existing) {
    throw new NotFoundError("file not found.");
  }

  const file = await fileRepository.addView(id);
  return formatFile(file);
};
