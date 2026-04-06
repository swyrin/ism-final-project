import prisma from "@ism/prisma";
import { HttpError } from "@srv/utils/HttpError";

export const createCategory = async (body: Record<string, unknown>) => {
  let { name } = body as { name?: string };
  if (!name) {
    throw new HttpError(400, "missing parameter.");
  }

  name = name.trim().toUpperCase();

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    throw new HttpError(403, "this category is exist.");
  }

  return prisma.category.create({ data: { name } });
};

export const getCategory = async () => prisma.category.findMany();

export const deleteCategory = async (body: Record<string, unknown>): Promise<{ message: string }> => {
  const { id } = body as { id?: string | number };
  if (!id) {
    throw new HttpError(400, "missing parameter.");
  }
  if (isNaN(Number(id))) {
    throw new HttpError(400, "id must be an integer.");
  }

  const numId = Number.parseInt(String(id), 10);
  const existing = await prisma.category.findUnique({ where: { id: numId } });
  if (!existing) {
    throw new HttpError(404, "category not found.");
  }

  await prisma.category.delete({ where: { id: numId } });
  return { message: "delete successfully." };
};
