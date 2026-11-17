const ALLOWED_RECITERS = new Set([
  "ar.alafasy",
  "ar.abdulbasitmurattal",
  "ar.husary",
]);

export default async function handler(req: any, res: any) {
  const r = String(req.query?.r || "");
  const n = Number(req.query?.n);

  if (!ALLOWED_RECITERS.has(r) || !Number.isInteger(n) || n < 1 || n > 6236) {
    res.status(400).json({ error: "Invalid reciter or ayah number" });
    return;
  }

  const target = `https://cdn.islamic.network/quran/audio/128/${r}/${n}.mp3`;
  const upstream = await fetch(target);
  if (!upstream.ok) {
    res.status(upstream.status).send("Audio unavailable");
    return;
  }

  const buf = Buffer.from(await upstream.arrayBuffer());
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(buf);
}
