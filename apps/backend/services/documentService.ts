import prisma from "@ism/prisma";
import * as documentRepository from "@srv/repository/documentRepository";
import { BadRequestError, HttpError } from "@srv/utils/HttpError";
import { v4 as uuidv4 } from "uuid";

async function generateId(): Promise<string> {
  while (true) {
    const id = uuidv4();
    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) return id;
  }
}

function formatDocument(doc: {
  id: string;
  title: string;
  history: { document_id: string; modified_at: Date }[];
  files?: unknown[];
}) {
  const sortedHistory = [...doc.history].toSorted(
    (a, b) => b.modified_at.getTime() - a.modified_at.getTime(),
  );
  return {
    id: doc.id,
    title: doc.title,
    modified_at: sortedHistory[0]?.modified_at.toISOString(),
    history: sortedHistory.map((h) => h.modified_at.toISOString()),
    ...(doc.files !== undefined && { files: doc.files }),
  };
}

export const createDocument = async (
  user_id: string,
  body: Record<string, unknown>,
): Promise<ReturnType<typeof formatDocument>> => {
  const { title } = body as { title?: string };
  if (!title) {
    throw new BadRequestError("missing parameter.");
  }

  const document_id = await generateId();

  try {
    const doc = await documentRepository.createDocument(user_id, document_id, title);
    return formatDocument(doc);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      throw new HttpError(409, "you already have a document with this title.");
    }
    throw err;
  }
};

export const getDocument = async (
  user_id: string,
  query: Record<string, unknown>,
): Promise<ReturnType<typeof formatDocument>> => {
  const { id } = query as { id?: string };
  if (!id) {
    throw new BadRequestError("missing parameter.");
  }

  const doc = await documentRepository.getOwnedDocumentWithFiles(user_id, id);
  if (!doc) {
    throw new HttpError(404, "document not found.");
  }

  const files = doc.files.map((file) => {
    const sortedHistory = [...file.history].toSorted(
      (a, b) => b.modified_at.getTime() - a.modified_at.getTime(),
    );
    return {
      id: file.id,
      title: file.title,
      category_id: file.category_id,
      author: file.author,
      description: file.description,
      document_id: file.document_id,
      view: file.view,
      category_name: file.category.name,
      modified_at: sortedHistory[0]?.modified_at.toISOString(),
      history: sortedHistory.map((h) => h.modified_at.toISOString()),
    };
  });

  return formatDocument({ ...doc, files });
};

export const changeDocumentName = async (
  user_id: string,
  body: Record<string, unknown>,
): Promise<ReturnType<typeof formatDocument>> => {
  const { id, title } = body as { id?: string; title?: string };
  if (!id || !title) {
    throw new BadRequestError("missing parameter.");
  }

  try {
    const doc = await documentRepository.renameDocument(user_id, id, title);
    return formatDocument(doc);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      throw new HttpError(409, "you already have a document with this title.");
    }
    throw err;
  }
};

export const deleteDocument = async (
  user_id: string,
  body: Record<string, unknown>,
): Promise<{ message: string }> => {
  const { id } = body as { id?: string };
  if (!id) {
    throw new BadRequestError("missing parameter.");
  }
  await documentRepository.deleteDocument(user_id, id);
  return { message: "delete successfully." };
};
