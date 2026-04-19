import * as fileRepository from "@srv/repository/fileRepository";
import * as shareRepository from "@srv/repository/shareRepository";
import { ForbiddenError, NotFoundError } from "@srv/utils/HttpError";

function buildShareUrl(share_id: string): string {
  const base = process.env.FE_ORIGIN || "http://localhost:5173";
  return `${base}/share/${share_id}`;
}

export async function createShare(
  user_id: string,
  file_id: string,
): Promise<{ shareUrl: string; id: string; createdAt: Date }> {
  const file = await fileRepository.getFileInformation(user_id, file_id);
  if (!file) {
    throw new NotFoundError("file not found.");
  }
  const share = await shareRepository.createShare(user_id, file_id);
  return {
    id: share.id,
    createdAt: share.createdAt,
    shareUrl: buildShareUrl(share.id),
  };
}

export async function listShares(
  user_id: string,
  file_id: string,
): Promise<Array<{ id: string; shareUrl: string; createdAt: Date }>> {
  const file = await fileRepository.getFileInformation(user_id, file_id);
  if (!file) {
    throw new NotFoundError("file not found.");
  }
  const shares = await shareRepository.listActiveSharesForFile(user_id, file_id);
  return shares.map((s) => ({
    id: s.id,
    createdAt: s.createdAt,
    shareUrl: buildShareUrl(s.id),
  }));
}

export async function revokeShare(user_id: string, share_id: string): Promise<void> {
  const result = await shareRepository.revokeShare(user_id, share_id);
  if (result.count === 0) {
    throw new ForbiddenError("share not found or not owned by user.");
  }
}

export async function getActiveShareForView(share_id: string) {
  const share = await shareRepository.getShareForView(share_id);
  if (!share || !share.isActive) {
    return null;
  }
  return share;
}

export async function getShareInfo(share_id: string): Promise<{
  id: string;
  isActive: boolean;
  owner: { id: string; name: string };
  file: {
    id: string;
    title: string;
    author: string;
    description: string;
    category_id: number;
    category_name: string;
  };
}> {
  const share = await shareRepository.getShareInfo(share_id);
  if (!share) {
    throw new NotFoundError("share not found.");
  }
  return {
    id: share.id,
    isActive: share.isActive,
    owner: { id: share.user.id, name: share.user.name },
    file: {
      id: share.file.id,
      title: share.file.title,
      author: share.file.author,
      description: share.file.description,
      category_id: share.file.category_id,
      category_name: share.file.category.name,
    },
  };
}
