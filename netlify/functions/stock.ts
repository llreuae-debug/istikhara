import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: false, photos: [] }),
    };
  }

  const q = (event.queryStringParameters?.q || "calm sky").trim();
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      q
    )}&orientation=portrait&per_page=12`;
    const res = await fetch(url, {
      headers: { Authorization: key },
    });
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ available: true, photos: [] }) };
    }
    const data = (await res.json()) as {
      photos?: Array<{
        id: number;
        photographer: string;
        photographer_url: string;
        src: { portrait: string; large2x: string; medium: string };
      }>;
    };
    const photos = (data.photos || []).map((p) => ({
      id: p.id,
      photographer: p.photographer,
      thumbUrl: p.src.medium,
      portraitUrl: p.src.portrait || p.src.large2x,
    }));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: true, photos }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        available: true,
        photos: [],
        error: err instanceof Error ? err.message : "Stock error",
      }),
    };
  }
};
