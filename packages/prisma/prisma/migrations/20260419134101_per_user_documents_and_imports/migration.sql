/*
  Warnings:

  - A unique constraint covering the columns `[user_id,title]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "imported_from_share_id" TEXT,
ADD COLUMN     "original_owner_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Document_user_id_title_key" ON "Document"("user_id", "title");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_imported_from_share_id_fkey" FOREIGN KEY ("imported_from_share_id") REFERENCES "Share"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_original_owner_id_fkey" FOREIGN KEY ("original_owner_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
