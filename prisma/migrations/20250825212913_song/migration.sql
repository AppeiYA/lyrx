/*
  Warnings:

  - You are about to drop the `Song` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Favorite" DROP CONSTRAINT "Favorite_songId_fkey";

-- DropTable
DROP TABLE "public"."Song";

-- CreateTable
CREATE TABLE "public"."songs" (
    "id" TEXT NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "geniusId" TEXT,
    "lyricsSource" "public"."LyricsSource" NOT NULL DEFAULT 'NONE',
    "customLyrics" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "songs_spotifyId_key" ON "public"."songs"("spotifyId");

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
