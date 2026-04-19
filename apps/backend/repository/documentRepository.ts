import prisma from "@ism/prisma";

export async function getDocumentById(id: string, user_id: string) {
  return await prisma.document.findUnique({ where: { id, user_id } });
}
