import prisma from "@ism/prisma";
import { BadRequestError } from "@srv/utils/HttpError";

export const search = async (user_id: string, query: Record<string, unknown>) => {
  const { q } = query as { q?: string };
  if (!q) {
    throw new BadRequestError("missing parameter.");
  }

  const files = await prisma.file.findMany({
    where: {
      user_id,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    include: {
      category: true,
      history: { orderBy: { modified_at: "desc" }, take: 1 },
    },
  });

  return files.map((file) => ({
    id: file.id,
    title: file.title,
    description: file.description,
    category: file.category.name,
    category_id: file.category_id,
    author: file.author,
    document_id: file.document_id,
    modified_at: file.history[0]?.modified_at.toISOString() ?? null,
  }));
};
