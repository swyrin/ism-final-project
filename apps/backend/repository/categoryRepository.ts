import prisma from "@ism/prisma";

export async function getCategoryById(id: string, user_id: string) {
  return await prisma.category.findUnique({
    where: { id: Number.parseInt(id, 10), user_id },
  });
}
