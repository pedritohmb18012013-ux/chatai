export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Prompt vazio' });

  const encoded = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&nologo=true&model=flux`;

  try {
    const r = await fetch(imageUrl);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const buffer = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (e) {
    res.status(500).json({ error: 'Falha ao gerar imagem: ' + e.message });
  }
}   
