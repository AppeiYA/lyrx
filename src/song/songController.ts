import type { Request, Response } from "express";
import type { SongService } from "./songService";
import songService from "./songService";
import getSpotifyToken from "./utils/getToken";
import { BadException, NotFoundError } from "../error/ErrorTypes";
import searchInSongs from "./genius/searchSong";

interface Artist {
  id: string;
  name: string;
  role: string | null;
  type: string;
}

interface saveSong {
  spotifyId: string;
  artists: Artist[];
  name: string;
}

export class SongController {
  constructor(private readonly songSrv: SongService) {}
  public songSearch = async (req: Request, res: Response) => {
    const token = await getSpotifyToken();
    const q = req.query.q || "wizkid";

    // const genius = await searchInSongs(q);
    // console.log(
    //   genius.map((geni) => ({
    //     // geni.result
    //     full_title: geni.result.full_title,
    //     title: geni.result.title,
    //     api_path: geni.result.api_path,
    //     primary_artist: geni.result.primary_artist,
    //     url: geni.result.url
    //   }))
    // );

    const response = await this.songSrv.searchSong(token, q);

    if (response instanceof BadException) {
      return res.status(response.statusCode).json({
        message: response.message,
        error: response.name,
      });
    }

    return res.status(200).json({
      message: "Search Success",
      data: response,
    });
  };

  public getSong = async (req: Request, res: Response) => {
    const token = await getSpotifyToken();
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "song id required",
      });
    }
    const response = await this.songSrv.getSong(token, id);

    if (response instanceof BadException) {
      return res.status(response.statusCode).json({
        message: response.message,
      });
    }

    if (response instanceof NotFoundError) {
      return res.status(response.statusCode).json({
        message: response.message || "Song not found",
      });
    }

    return res.status(200).json({
      message: "song found",
      data: response,
    });
  };

  public topSongs = async (req: Request, res: Response) => {
    const token = await getSpotifyToken();

    const response = await this.songSrv.topSongs(token);
    if (response instanceof BadException) {
      return res.status(response.statusCode).json({
        message: response.message,
      });
    }
    if (response instanceof NotFoundError) {
      return res.status(response.statusCode).json({
        message: response.message,
      });
    }

    return res.status(200).json({
      message: "Top 10",
      // data: response.items.map((item: any) => ({
      //   name: item.track.name,
      //   artist: item.track.artists.map((a: any) => a.name).join(", "),
      //   popularity: item.track.popularity,
      // })),
      data: response.slice(0,10),
    });
  };

  private saveSong = async () => {};
}

const songController = new SongController(songService);

export default songController;
