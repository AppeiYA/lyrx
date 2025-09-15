import axios from "axios";
import { BadException, NotFoundError } from "../error/ErrorTypes";
import { parseTop50Global } from "./utils/topSongsGlobal";
import dal from "../config/dal";
import cuid from "cuid";

export interface SongService {
  searchSong(token: string, query: any): Promise<any | BadException>;
  getSong(
    token: string,
    id: string
  ): Promise<any | BadException | NotFoundError>;
  topSongs(token: string): Promise<any | BadException | NotFoundError>;
}

export class SongServiceImpl implements SongService {
  async searchSong(token: string, query: string): Promise<any | BadException> {
    try {
      const search = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query as string
        )}&type=track`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(search.data);

      return search?.data;
    } catch (error: any) {
      return new BadException(error?.message, 500);
    }
  }

  async getSong(
    token: string,
    id: string
  ): Promise<any | BadException | NotFoundError> {
    try {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 404) return new NotFoundError("Song not found");
        if (response.status === 401)
          return new BadException("Invalid or expired token");
        return new BadException(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();

      // --- Check if song exists ---
      let songId: string;
      const checkSong = await dal.One(
        `SELECT * FROM songs WHERE "spotifyId" = $1`,
        [data.id]
      );

      if (checkSong instanceof NotFoundError) {
        const now = new Date().toISOString();
        const insertSong = await dal.One(
          `INSERT INTO songs (id, "spotifyId", title, "lyricsSource", "updatedAt", "createdAt") 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [cuid(), data.id, data.name, "NONE", now, now]
        );

        if (insertSong instanceof BadException)
          return new BadException("Error storing fetched song");
        if (insertSong instanceof NotFoundError)
          return new NotFoundError("Error storing fetched song");

        songId = insertSong.id;
      } else {
        songId = checkSong.id;
      }

      // --- Handle artists ---
      for (const artist of data.artists) {
        let artistId: string;
        const checkArtist = await dal.One(
          `SELECT * FROM artists WHERE "spotifyId" = $1`,
          [artist.id]
        );

        if (checkArtist instanceof NotFoundError) {
          const insertArtist = await dal.One(
            `INSERT INTO artists (id, "spotifyId", name, "updatedAt")
           VALUES ($1, $2, $3, $4) RETURNING id`,
            [cuid(), artist.id, artist.name, new Date().toISOString()]
          );

          if (insertArtist instanceof BadException)
            return new BadException(insertArtist.message);
          artistId = insertArtist.id;
        } else {
          artistId = checkArtist.id;
        }

        const link = await dal.None(
          `INSERT INTO song_artists (id, "songId", "artistId")
         VALUES ($1, $2, $3)`,
          [cuid(), songId, artistId]
        );

        if (link instanceof BadException) return new BadException(link.message);
      }

      return data;
    } catch (error) {
      console.error(error);
      return new BadException("Unable to fetch song");
    }
  }

  async topSongs(token: string): Promise<any | BadException | NotFoundError> {
    try {
      const top50Global = await parseTop50Global();
      if (top50Global instanceof BadException) {
        return new BadException(top50Global.message);
      }
      if (top50Global instanceof NotFoundError) {
        return new NotFoundError(top50Global.message);
      }
      console.log(top50Global);

      return top50Global;
    } catch (err) {
      console.log(err);
      return new BadException("An error occured fetching songs");
    }
  }
}

const songService = new SongServiceImpl();
export default songService;
