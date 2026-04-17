/*
  Warnings:

  - You are about to drop the column `author` on the `Share` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Share` table. All the data in the column will be lost.
  - You are about to drop the column `storagePath` on the `Share` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Share` table. All the data in the column will be lost.
  - Added the required column `fid` to the `Share` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Share" DROP COLUMN "author",
DROP COLUMN "description",
DROP COLUMN "storagePath",
DROP COLUMN "title",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fid" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_fid_fkey" FOREIGN KEY ("fid") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
