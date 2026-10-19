export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { messages } = req.body || {};
  const apiKey = process.env.GROQ_API_KEY;

  if (!messages || !messages.length) {
    return res.status(400).json({ reply: 'Nenhuma mensagem recebida.' });
  }

  // Limita às últimas 10 mensagens (segurança)
  const recent = messages.slice(-10);

  // Converte para formato da API
  const formatted = recent.map(m => {
    if (m.image) {
      return {
        role: m.role,
        content: [
          { type: 'text', text: m.text || 'Descreva esta imagem.' },
          { type: 'image_url', image_url: { url: m.image } }
        ]
      };
    }
    return { role: m.role, content: m.text };
  });

  const hasImage = recent.some(m => m.image);
  const model = hasImage ? 'qwen/qwen3.8-27b' : 'openai/gpt-oss-120b';

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'Você é um assistente de estudos. Regras: Responda APENAS com a resposta final. Nunca mostre raciocínio, dúvidas ou correções. Nunca use asteriscos, travessões ou "pensando em voz alta". Se for exercício, liste só as respostas numeradas. Seja direto e bem escrito. Responda em português do Brasil. Lembre-se do contexto da conversa.' },
          ...formatted
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
