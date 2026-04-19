import prisma from "@ism/prisma";
import { HttpError } from "@srv/utils/HttpError";

export const createCategory = async (user_id: string, body: Record<string, unknown>) => {
  let { name } = body as { name?: string };
  if (!name) {
    throw new HttpError(400, "missing parameter.");
  }

  name = name.trim().toUpperCase();

  const existing = await prisma.category.findFirst({ where: { name, user_id } as any });
  if (existing) {
    throw new HttpError(403, "this category is exist.");
  }

  return prisma.category.create({ data: { name, user_id } as any });
};

export const getCategory = async (user_id: string) => prisma.category.findMany({ where: { user_id } as any });

export const deleteCategory = async (
  user_id: string,
  body: Record<string, unknown>,
): Promise<{ message: string }> => {
  const { id } = body as { id?: string | number };
  if (!id) {
    throw new HttpError(400, "missing parameter.");
  }
  if (isNaN(Number(id))) {
    throw new HttpError(400, "id must be an integer.");
  }

  const numId = Number.parseInt(String(id), 10);
  const existing = await prisma.category.findFirst({ where: { id: numId, user_id } as any });
  if (!existing) {
    throw new HttpError(404, "category not found.");
  }

  await prisma.category.deleteMany({ where: { id: numId, user_id } as any });
  return { message: "delete successfully." };
};
