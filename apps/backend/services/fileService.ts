import prisma from "@ism/prisma";
import * as minioService from "@srv/infra/storage/minioService";
import { HttpError } from "@srv/utils/HttpError";

function formatFile(file: {
  id: string;
  title: string;
  cid: number;
  author: string;
  description: string;
  did: string;
  view: number;
  storagePath: string;
  category?: { name: string };
  history: { fid: string; modified_at: Date }[];
}) {
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
    ...(file.category && { category_name: file.category.name }),
    modified_at: sortedHistory[0]?.modified_at.toISOString(),
    history: sortedHistory.map((h) => h.modified_at.toISOString()),
  };
}

export const createFile = async (
  body: Record<string, unknown>,
  fid: string,
  buffer: Buffer,
  contentType: string,
): Promise<ReturnType<typeof formatFile>> => {
  const { title, cid, author, did, description } = body as {
    title?: string;
    cid?: string;
    author?: string;
    did?: string;
    description?: string;
  };

  if (!(title && cid && author && did && description)) {
    throw new HttpError(400, "missing parameter.");
  }

  const category = await prisma.category.findUnique({ where: { id: Number.parseInt(cid, 10) } });
  if (!category) {
    throw new HttpError(404, "category not found.");
  }

  const document = await prisma.document.findUnique({ where: { id: did } });
  if (!document) {
    throw new HttpError(404, "document not found.");
  }

  const storageKey = `${fid}.pdf`;
  await minioService.uploadFile(storageKey, buffer, contentType);

  let file;
  try {
    file = await prisma.file.create({
      data: {
        id: fid,
        title,
        cid: Number.parseInt(cid, 10),
        author,
        description,
        did,
        view: 0,
        storagePath: storageKey,
        history: { create: { modified_at: new Date() } },
      },
      include: { category: true, history: true },
    });
  } catch (error) {
    await minioService.deleteFile(storageKey);
    throw error;
  }

  return formatFile(file);
};

export const editFileInformation = async (
  id: string,
  body: Record<string, unknown>,
): Promise<ReturnType<typeof formatFile>> => {
  const { title, cid, description } = body as {
    title?: string;
    cid?: string;
    description?: string;
  };

  if (!title && !cid && !description) {
    throw new HttpError(400, "missing parameter.");
  }

  if (cid) {
    const category = await prisma.category.findUnique({ where: { id: Number.parseInt(cid, 10) } });
    if (!category) {
      throw new HttpError(404, "category not found.");
    }
  }

  const file = await prisma.file.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(cid && { cid: Number.parseInt(cid, 10) }),
      ...(description && { description }),
      history: { create: { modified_at: new Date() } },
    },
    include: { category: true, history: true },
  });

  return formatFile(file);
};

export const getFileInformation = async (
  id: string,
): Promise<ReturnType<typeof formatFile> & { fileUrl: string }> => {
  const file = await prisma.file.findUnique({
    where: { id },
    include: { history: true },
  });

  if (!file) {
    throw new HttpError(404, "file not found.");
  }

  return {
    ...formatFile(file),
    fileUrl: minioService.buildFileUrl(file.storagePath),
  };
};

export const deleteFile = async (id: string): Promise<{ message: string }> => {
  const file = await prisma.file.findUnique({
    where: { id },
    select: { storagePath: true },
  });

  if (!file) {
    throw new HttpError(404, "file not found.");
  }

  await prisma.file.delete({ where: { id } });
  await minioService.deleteFile(file.storagePath);

  return { message: "delete successfully." };
};

export const addView = async (id: string): Promise<ReturnType<typeof formatFile>> => {
  const existing = await prisma.file.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    throw new HttpError(404, "file not found.");
  }

  const file = await prisma.file.update({
    where: { id },
    data: { view: { increment: 1 } },
    include: { history: true },
  });

  return formatFile(file);
};
