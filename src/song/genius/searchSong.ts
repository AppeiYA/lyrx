import fetch from "node-fetch";
import type { GeniusHit } from "./interfaces/geniusHit";

const genius_api_base = process.env.GENIUS_API_BASE!;
const access_token = process.env.GENIUS_ACCESS_TOKEN!;

const searchInSongs = async (query: any): Promise<GeniusHit[]> => {
  const response = await fetch(
    `${genius_api_base}/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const data = await response.json() as any;
  return data?.response?.hits;
};

export default searchInSongs;
