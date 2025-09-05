import axios from "axios";
import { BadException, NotFoundError } from "../error/ErrorTypes";

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle non-200 responses
      if (!response.ok) {
        if (response.status === 404) {
          return new NotFoundError("Song not found");
        }
        if (response.status === 401) {
          return new BadException("Invalid or expired token");
        }
        return new BadException(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return new BadException("Unable to fetch song");
    }
  }

  async topSongs(token: string): Promise<any | BadException | NotFoundError> {
    try {
      const playlistId = "37i9dQZEVXbMDoHDwVN2tF"; // Top 50 Global
      console.log("PlaylistId:", JSON.stringify(playlistId));


      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res) {
        return new BadException("Playlist not found");
      }

      const data = await res.json();
      if (data?.error) {
        return new BadException(data.error.message);
      }
      return data;
    } catch (err) {
      console.log(err);
      return new BadException("An error occured fetching songs");
    }
  }
}

const songService = new SongServiceImpl();
export default songService;
