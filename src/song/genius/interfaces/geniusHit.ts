interface GeniusArtist {
  id: number;
  name: string;
  url: string;
  image_url: string;
}

interface GeniusResult {
  annotation_count: number;
  api_path: string;
  full_title: string;
  id: number;
  lyrics_owner_id: number;
  path: string;
  primary_artist: GeniusArtist;
  song_art_image_thumbnail_url: string;
  song_art_image_url: string;
  stats: {
    hot: boolean;
    pageviews?: number;
  };
  title: string;
  title_with_featured: string;
  url: string;
}

export interface GeniusHit {
  index: string; // usually "song"
  type: string;
  result: GeniusResult;
}

interface GeniusSearchResponse {
  response: {
    hits: GeniusHit[];
  };
}
