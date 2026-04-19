-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "user_id" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "user_id" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
