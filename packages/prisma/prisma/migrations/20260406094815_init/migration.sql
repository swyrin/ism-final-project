-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document_History" (
    "did" TEXT NOT NULL,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_History_pkey" PRIMARY KEY ("did","modified_at")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cid" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "did" TEXT NOT NULL,
    "view" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File_History" (
    "fid" TEXT NOT NULL,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_History_pkey" PRIMARY KEY ("fid","modified_at")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Document_History" ADD CONSTRAINT "Document_History_did_fkey" FOREIGN KEY ("did") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_cid_fkey" FOREIGN KEY ("cid") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_did_fkey" FOREIGN KEY ("did") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File_History" ADD CONSTRAINT "File_History_fid_fkey" FOREIGN KEY ("fid") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
