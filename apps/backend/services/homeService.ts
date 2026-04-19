import prisma from "@ism/prisma";

export const getAllDocuments = async (user_id: string) => {
  const [documents, stats] = await Promise.all([
    prisma.document.findMany({ where: { user_id }, include: { history: true } }),
    prisma.file.aggregate({
      where: { user_id },
      _sum: { view: true },
      _count: { _all: true },
    }),
  ]);

  const documentsFormatted = documents
    .map((doc) => {
      const sortedHistory = [...doc.history].toSorted(
        (a, b) => b.modified_at.getTime() - a.modified_at.getTime(),
      );
      return {
        id: doc.id,
        title: doc.title,
        modified_at: sortedHistory[0]?.modified_at.toISOString() ?? null,
        history: sortedHistory.map((h) => h.modified_at.toISOString()),
      };
    })
    .toSorted((a, b) => {
      const aTime = a.modified_at ? new Date(a.modified_at).getTime() : 0;
      const bTime = b.modified_at ? new Date(b.modified_at).getTime() : 0;
      return bTime - aTime;
    });

  return {
    documents: documentsFormatted,
    total_views: stats._sum.view ?? 0,
    total_files: stats._count._all,
  };
};
