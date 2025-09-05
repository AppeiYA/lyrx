/*
  Warnings:

  - You are about to drop the column `musicId` on the `Favorite` table. All the data in the column will be lost.
  - Added the required column `songId` to the `Favorite` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."LyricsSource" AS ENUM ('GENIUS', 'CUSTOM', 'NONE');

-- AlterTable
ALTER TABLE "public"."Favorite" DROP COLUMN "musicId",
ADD COLUMN     "songId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Song" (
    "id" TEXT NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "geniusId" TEXT,
    "lyricsSource" "public"."LyricsSource" NOT NULL DEFAULT 'NONE',
    "customLyrics" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Song_spotifyId_key" ON "public"."Song"("spotifyId");

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
