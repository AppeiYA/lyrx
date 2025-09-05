/*
  Warnings:

  - You are about to drop the `Favorite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Favorite" DROP CONSTRAINT "Favorite_songId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- DropTable
DROP TABLE "public"."Favorite";

-- CreateTable
CREATE TABLE "public"."favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
