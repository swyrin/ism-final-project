import prisma from "@ism/prisma";
import { HttpError } from "@srv/utils/HttpError";
import { v4 as uuidv4 } from "uuid";

async function generateId(): Promise<string> {
  while (true) {
    const id = uuidv4();
    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) {
      return id;
    }
  }
}

function formatDocument(doc: {
  id: string;
  title: string;
  history: { did: string; modified_at: Date }[];
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
  body: Record<string, unknown>,
): Promise<ReturnType<typeof formatDocument>> => {
  const { title } = body as { title?: string };
  if (!title) {
    throw new HttpError(400, "missing parameter.");
  }

  const did = await generateId();

  const doc = await prisma.document.create({
    data: {
      id: did,
      title,
      history: { create: { modified_at: new Date() } },
    },
    include: { history: true },
  });

  return formatDocument(doc);
};

export const getDocument = async (
  query: Record<string, unknown>,
): Promise<ReturnType<typeof formatDocument>> => {
  const { id } = query as { id?: string };
  if (!id) {
    throw new HttpError(400, "missing parameter.");
  }

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      history: true,
      files: {
        include: {
          category: true,
          history: { orderBy: { modified_at: "desc" } },
        },
      },
    },
  });

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
      cid: file.cid,
      author: file.author,
      description: file.description,
      did: file.did,
      view: file.view,
      category_name: file.category.name,
      modified_at: sortedHistory[0]?.modified_at.toISOString(),
      history: sortedHistory.map((h) => h.modified_at.toISOString()),
    };
  });

  return formatDocument({ ...doc, files });
};

export const changeDocumentName = async (
  body: Record<string, unknown>,
): Promise<ReturnType<typeof formatDocument>> => {
  const { id, title } = body as { id?: string; title?: string };
  if (!id || !title) {
    throw new HttpError(400, "missing parameter.");
  }

  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, "document not found.");
  }

  const doc = await prisma.document.update({
    where: { id },
    data: {
      title,
      history: { create: { modified_at: new Date() } },
    },
    include: { history: true },
  });

  return formatDocument(doc);
};

export const deleteDocument = async (body: Record<string, unknown>): Promise<{ message: string }> => {
  const { id } = body as { id?: string };
  if (!id) {
    throw new HttpError(400, "missing parameter.");
  }

  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, "document not found.");
  }

  // Cascade deletes File, FileHistory, DocumentHistory
  await prisma.document.delete({ where: { id } });

  return { message: "delete successfully." };
};
