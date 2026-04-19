import prisma from "@ism/prisma";
import { NotFoundError } from "@srv/utils/HttpError";

export async function getOwnedDocumentOrThrow(user_id: string, id: string) {
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.user_id !== user_id) {
    throw new NotFoundError("document not found.");
  }
  return doc;
}

export async function getOwnedDocumentByTitle(user_id: string, title: string) {
  return await prisma.document.findUnique({ where: { user_id_title: { user_id, title } } });
}

export async function listDocumentsForUser(user_id: string) {
  return await prisma.document.findMany({
    where: { user_id },
    include: { history: true },
  });
}

export async function createDocument(user_id: string, id: string, title: string) {
  return await prisma.document.create({
    data: {
      id,
      user_id,
      title,
      history: { create: { modified_at: new Date() } },
    },
    include: { history: true },
  });
}

export async function renameDocument(user_id: string, id: string, title: string) {
  await getOwnedDocumentOrThrow(user_id, id);
  return await prisma.document.update({
    where: { id },
    data: {
      title,
      history: { create: { modified_at: new Date() } },
    },
    include: { history: true },
  });
}

export async function deleteDocument(user_id: string, id: string) {
  await getOwnedDocumentOrThrow(user_id, id);
  await prisma.document.delete({ where: { id } });
}

export async function getOwnedDocumentWithFiles(user_id: string, id: string) {
  await getOwnedDocumentOrThrow(user_id, id);
  return await prisma.document.findUnique({
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
}
