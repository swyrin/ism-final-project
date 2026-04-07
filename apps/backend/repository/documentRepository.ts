import prisma from "@ism/prisma";

export async function getDocumentById(id: string) {
  return await prisma.document.findUnique({ where: { id } });
}
