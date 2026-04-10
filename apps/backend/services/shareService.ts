import * as minioService from "@srv/infra/storage/minioService";
import * as fileRepository from "@srv/repository/fileRepository";
import * as shareRepository from "@srv/repository/shareRepository";
import { BadRequestError, NotFoundError } from "@srv/utils/HttpError";
import { v4 as uuidv4 } from "uuid";

export const createShareFile = async (user_id: string, file_id: string): Promise<string> => {
  const share_id = uuidv4();
  const base_url = process.env.BACKEND_URL || "http://localhost:5000";

  try {
    const file = await fileRepository.getFileInformation(user_id, file_id);
    if (!file) {
      throw new NotFoundError("file not found.");
    }

    const storage_path = file.storagePath;
    const ext = require("path").extname(storage_path); // ".pdf"
    const share_storage_path = `file/share/${share_id}${ext}`;

    await shareRepository.createShareFile(user_id, share_id, {
      title: file.title,
      author: file.author,
      description: file.description,
      storageKey: share_storage_path,
    });

    await minioService.copyFile(storage_path, share_storage_path);

    return `${base_url}/share/${share_id}`;
  } catch (e) {
    await shareRepository.deleteShareFile(user_id, share_id);
    throw new BadRequestError("failed to share file.");
  }
};

export const addShareFile = async (
  user_id: string,
  document_id: string,
  category_id: string,
  share_id: string,
): Promise<boolean> => {
  const fileId = await fileRepository.generateFileId();

  const share = await shareRepository.getShareFile(share_id);
  if (!share) {
    throw new NotFoundError("share not found.");
  }

  const share_storage_path = share.storagePath;
  const ext = require("path").extname(share_storage_path);
  const new_storage_path = `${fileId}${ext}`;

  try {
    await minioService.copyFile(share_storage_path, new_storage_path);

    await fileRepository.createFile(user_id, fileId, {
      title: share.title,
      author: share.author,
      description: share.description,
      document_id: document_id,
      category_id: category_id,
      storageKey: new_storage_path,
    });

    await shareRepository.deleteShareFile(user_id, share_id);
    await minioService.deleteFile(share_storage_path);

    return true;
  } catch (e) {
    await minioService.deleteFile(new_storage_path).catch(() => undefined);
    throw new BadRequestError("failed to add shared file.");
  }
};
