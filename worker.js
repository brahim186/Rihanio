addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event.env)) // أضفنا event.env هنا
})

async function handleRequest(request, env) { // أضفنا env هنا
  if (request.method !== 'POST') return new Response("Only POST allowed", { status: 405 });

  const { message, lang } = await request.json();
  
  // الآن الكود يسحب المفتاح من إعدادات Cloudflare (Secrets) بأمان
  const GEMINI_API_KEY = env.GEMINI_API_KEY; 

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `You are an assistant for Rihanio. Language: ${lang}. Answer this: ${message}` }] }]
    })
  });

  const data = await response.json();
  const reply = data.candidates[0].content.parts[0].text;

  return new Response(JSON.stringify({ reply }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
