import prisma from "@ism/prisma";
import { v4 as uuidv4 } from "uuid";

export async function createShareFile(
  user_id: string,
  share_id: string,
  data: {
    title: string;
    author: string;
    description: string;
    storageKey: string;
  },
) {
  return await prisma.share.create({
    data: {
      id: share_id,
      user_id: user_id,
      title: data.title,
      author: data.author,
      description: data.description,
      storagePath: data.storageKey,
    },
  });
}
export async function deleteShareFile(user_id: string, file_id: string) {
  return await prisma.share.delete({
    where: {
      id: file_id,
      user_id: user_id,
    },
  });
}
export async function getShareFile(share_id: string) {
  return await prisma.share.findUnique({
    where: {
      id: share_id,
    },
  });
}
