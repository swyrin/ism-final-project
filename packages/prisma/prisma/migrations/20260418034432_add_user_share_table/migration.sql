-- CreateTable
CREATE TABLE "UserShare" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "UserShare_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserShare" ADD CONSTRAINT "UserShare_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
