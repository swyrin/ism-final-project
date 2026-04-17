import * as fileRepository from "@srv/repository/fileRepository";
import * as shareRepository from "@srv/repository/shareRepository";
import { ForbiddenError, NotFoundError } from "@srv/utils/HttpError";

function buildShareUrl(share_id: string): string {
  const base = process.env.BACKEND_URL || "http://localhost:5000";
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
