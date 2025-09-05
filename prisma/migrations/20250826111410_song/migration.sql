/*
  Warnings:

  - You are about to drop the column `artist` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `songs` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ArtistRole" AS ENUM ('MAIN', 'FEATURED');

-- AlterTable
ALTER TABLE "public"."songs" DROP COLUMN "artist",
DROP COLUMN "features";

-- CreateTable
CREATE TABLE "public"."artists" (
    "id" TEXT NOT NULL,
    "spotifyId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."song_artists" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "role" "public"."ArtistRole" NOT NULL DEFAULT 'FEATURED',

    CONSTRAINT "song_artists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artists_spotifyId_key" ON "public"."artists"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "artists_name_key" ON "public"."artists"("name");

-- CreateIndex
CREATE UNIQUE INDEX "song_artists_songId_artistId_key" ON "public"."song_artists"("songId", "artistId");

-- AddForeignKey
ALTER TABLE "public"."song_artists" ADD CONSTRAINT "song_artists_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."song_artists" ADD CONSTRAINT "song_artists_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
