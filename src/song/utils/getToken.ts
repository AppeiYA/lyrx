import axios from "axios";
import redis from "../../utils/redisClient";

const getSpotifyToken = async (): Promise<string> => {
  // check if spotify token dey cached
  const cachedToken = await redis.get("spotify_access_token");
  if (cachedToken) {
    return cachedToken;
  }

  // request new token
  const client_id = process.env.SPOTIFY_CLIENT_ID!;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    params.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
    }
  );

  const access_token = response.data.access_token;
//   const expires_in = response.data.access_token;

  const expires_in = parseInt(response.data.expires_in, 10); // force integer
  const expirySeconds = Math.max(1, expires_in - 30); // ensure >= 1

  //   save token to redis with expiry
  await redis.set("spotify_access_token", access_token, "EX", expirySeconds);

  return access_token;
};

export default getSpotifyToken;
