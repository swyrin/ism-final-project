import prisma from "@ism/prisma";
import * as minioService from "@srv/infra/storage/minioService";
import * as documentRepository from "@srv/repository/documentRepository";
import * as fileRepository from "@srv/repository/fileRepository";
import * as shareRepository from "@srv/repository/shareRepository";
import { BadRequestError, HttpError, NotFoundError } from "@srv/utils/HttpError";
import { v4 as uuidv4 } from "uuid";

export interface ImportBody {
  document_id?: string;
  new_document_title?: string;
}

function formatFile(file: {
  id: string;
  title: string;
  category_id: number;
  author: string;
  description: string;
  document_id: string;
  view: number;
  storagePath: string;
  category?: { name: string };
  history: { file_id: string; modified_at: Date }[];
}) {
  const sortedHistory = [...file.history].toSorted(
    (a, b) => b.modified_at.getTime() - a.modified_at.getTime(),
  );
  return {
    id: file.id,
    title: file.title,
    category_id: file.category_id,
    author: file.author,
    description: file.description,
    document_id: file.document_id,
    view: file.view,
    ...(file.category && { category_name: file.category.name }),
    modified_at: sortedHistory[0]?.modified_at.toISOString(),
    history: sortedHistory.map((h) => h.modified_at.toISOString()),
  };
}

export async function importFromShare(
  importer_user_id: string,
  share_id: string,
  body: ImportBody,
): Promise<ReturnType<typeof formatFile>> {
  // Validate body: exactly one of document_id or new_document_title
  const hasDocId = typeof body.document_id === "string" && body.document_id.length > 0;
  const hasNewTitle = typeof body.new_document_title === "string" && body.new_document_title.length > 0;
  if (hasDocId === hasNewTitle) {
    throw new BadRequestError("provide exactly one of document_id or new_document_title.");
  }

  // Load and validate share
  const share = await shareRepository.getShareForView(share_id);
  if (!share) {
    throw new NotFoundError("share not found.");
  }
  if (!share.isActive) {
    throw new BadRequestError("share is no longer active.");
  }
  if (share.user_id === importer_user_id) {
    throw new BadRequestError("cannot import your own share.");
  }

  const newFileId = await fileRepository.generateFileId();
  const storageKey = `${importer_user_id}/${newFileId}.pdf`;
  let createdDocumentId: string | null = null;

  // DB transaction: resolve/create destination document + insert File row
  const newFile = await prisma.$transaction(async (tx) => {
    let destinationDocumentId: string;

    if (hasDocId) {
      await documentRepository.getOwnedDocumentOrThrow(importer_user_id, body.document_id!);
      destinationDocumentId = body.document_id!;
    } else {
      const newDocId = uuidv4();
      try {
        await tx.document.create({
          data: {
            id: newDocId,
            user_id: importer_user_id,
            title: body.new_document_title!,
            history: { create: { modified_at: new Date() } },
          },
        });
      } catch (err: unknown) {
        if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
          throw new HttpError(409, "you already have a document with this title.");
        }
        throw err;
      }
      destinationDocumentId = newDocId;
      createdDocumentId = newDocId;
    }

    return await tx.file.create({
      data: {
        user_id: importer_user_id,
        id: newFileId,
        title: share.file.title,
        category_id: share.file.category_id,
        author: share.file.author,
        description: share.file.description,
        document_id: destinationDocumentId,
        storagePath: storageKey,
        view: 0,
        imported_from_share_id: share.id,
        original_owner_id: share.user_id,
        history: { create: { modified_at: new Date() } },
      },
      include: { category: true, history: true },
    });
  });

  // MinIO copy — outside the transaction, after commit
  try {
    await minioService.copyFile(share.file.storagePath, storageKey);
  } catch {
    // Compensation: delete the File row and any Document created for this import
    try {
      await prisma.file.delete({ where: { id: newFileId } });
    } catch {
      /* best-effort */
    }
    if (createdDocumentId) {
      try {
        await prisma.document.delete({ where: { id: createdDocumentId } });
      } catch {
        /* best-effort */
      }
    }
    throw new HttpError(500, "failed to copy file object during import.");
  }

  return formatFile(newFile);
}
