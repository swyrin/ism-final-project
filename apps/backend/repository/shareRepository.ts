import prisma from "@ism/prisma";
import { v4 as uuidv4 } from "uuid";

export async function createShare(user_id: string, file_id: string) {
  return await prisma.share.create({
    data: {
      id: uuidv4(),
      user_id,
      file_id,
      isActive: true,
    },
  });
}

export async function listActiveSharesForFile(user_id: string, file_id: string) {
  return await prisma.share.findMany({
    where: {
      file_id,
      user_id,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeShare(user_id: string, share_id: string) {
  return await prisma.share.updateMany({
    where: {
      id: share_id,
      user_id,
    },
    data: { isActive: false },
  });
}

export async function getShareForView(share_id: string) {
  return await prisma.share.findUnique({
    where: { id: share_id },
    include: {
      file: true,
      user: { select: { id: true, name: true } },
    },
  });
}

export async function getShareInfo(share_id: string) {
  return await prisma.share.findUnique({
    where: { id: share_id },
    select: {
      id: true,
      isActive: true,
      user_id: true,
      file: {
        select: {
          id: true,
          title: true,
          author: true,
          description: true,
          category_id: true,
          category: { select: { name: true } },
        },
      },
      user: { select: { id: true, name: true } },
    },
  });
}
