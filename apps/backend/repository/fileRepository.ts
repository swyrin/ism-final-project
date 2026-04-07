import prisma from "@ism/prisma";
import { v4 as uuidv4 } from "uuid";

export async function generateFileId(): Promise<string> {
  while (true) {
    const id = uuidv4();
    const existing = await prisma.file.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return id;
    }
  }
}

export async function createFile(
  user_id: string,
  file_id: string,
  data: {
    title: string;
    category_id: string;
    author: string;
    description: string;
    document_id: string;
    storageKey: string;
  },
) {
  return await prisma.file.create({
    data: {
      user_id,
      id: file_id,
      title: data.title,
      category_id: Number.parseInt(data.category_id, 10),
      author: data.author,
      description: data.description,
      document_id: data.document_id,
      view: 0,
      storagePath: data.storageKey,
      history: {
        create: { modified_at: new Date() },
      },
    },
    include: { category: true, history: true },
  });
}

export async function editFileInformation(
  user_id: string,
  id: string,
  data: { title?: string; category_id?: string; description?: string },
) {
  const { title, category_id, description } = data;

  return await prisma.file.update({
    where: { id, user_id },
    data: {
      ...(title && { title }),
      ...(category_id && { category_id: Number.parseInt(category_id, 10) }),
      ...(description && { description }),
      history: { create: { modified_at: new Date() } },
    },
    include: { category: true, history: true },
  });
}

export async function addView(id: string) {
  return await prisma.file.update({
    where: { id },
    data: { view: { increment: 1 } },
    include: { history: true },
  });
}

export async function isFileExist(user_id: string, id: string): Promise<boolean> {
  const existing = await prisma.file.findUnique({
    where: { id, user_id },
    select: { id: true },
  });
  return !!existing;
}

export async function deleteFile(user_id: string, id: string) {
  await prisma.file.delete({ where: { id, user_id } });
}

export async function getFileInformation(user_id: string, id: string) {
  return await prisma.file.findUnique({
    where: { id, user_id },
    include: { history: true },
  });
}

export async function getFilesByDocumentId(user_id: string, document_id: string, category_id?: string) {
  return await prisma.file.findMany({
    where: {
      user_id,
      document_id,
      category_id: category_id ? Number.parseInt(category_id, 10) : undefined,
    },
    select: {
      id: true,
      title: true,
      storagePath: true,
      history: true,
    },
  });
}
