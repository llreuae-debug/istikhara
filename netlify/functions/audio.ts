const ALLOWED_RECITERS = new Set([
  "ar.alafasy",
  "ar.abdulbasitmurattal",
  "ar.husary",
]);

export default async (req: Request) => {
  const url = new URL(req.url);
  const r = url.searchParams.get("r") || "";
  const n = Number(url.searchParams.get("n"));

  if (!ALLOWED_RECITERS.has(r) || !Number.isInteger(n) || n < 1 || n > 6236) {
    return new Response(JSON.stringify({ error: "Invalid reciter or ayah number" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const target = `https://cdn.islamic.network/quran/audio/128/${r}/${n}.mp3`;
  const upstream = await fetch(target);
  if (!upstream.ok) {
    return new Response("Audio unavailable", { status: upstream.status });
  }

  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
