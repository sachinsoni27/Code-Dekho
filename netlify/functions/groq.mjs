export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const apiKey = Netlify.env.get('GROQ_API_KEY');

  if (!apiKey) {
    return Response.json(
      { error: 'GROQ_API_KEY not configured in environment' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Something went wrong' }, { status: 500 });
  }
};

export const config = {
  path: '/api/groq',
  method: 'POST',
};
