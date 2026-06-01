export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, system } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: system || '',
              },
            ],
          },
          contents: messages.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [
              {
                text: msg.content,
              },
            ],
          })),
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      content:
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No response generated',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
}
