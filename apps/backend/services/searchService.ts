import prisma from "@ism/prisma";
import { HttpError } from "@srv/utils/HttpError";

export const search = async (query: Record<string, unknown>) => {
  const { q } = query as { q?: string };
  if (!q) {
    throw new HttpError(400, "missing parameter.");
  }

  const files = await prisma.file.findMany({
    where: {
      OR: [
        { id: { contains: q, mode: "insensitive" } },
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
    cid: file.cid,
    author: file.author,
    did: file.did,
    modified_at: file.history[0]?.modified_at.toISOString() ?? null,
  }));
};
