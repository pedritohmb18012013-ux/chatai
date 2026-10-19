export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message, image } = req.body || {};
  const apiKey = process.env.GROQ_API_KEY;

  let content;
  if (image) {
    content = [
      { type: 'text', text: message || 'Descreva esta imagem.' },
      { type: 'image_url', image_url: { url: image } }
    ];
  } else {
    content = message;
  }

  const model = image ? 'qwen/qwen3.8-27b' : 'openai/gpt-oss-120b';

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Você é um assistente de estudos. Responda em português de forma clara e bem escrita.' },
          { role: 'user', content }
        ],
        max_tokens: 500
      })
    });
    const data = await r.json();
    res.json({ reply: data.choices?.[0]?.message?.content || 'Erro na IA' });
  } catch (e) {
    res.status(500).json({ reply: 'Falha: ' + e.message });
  }
}   
