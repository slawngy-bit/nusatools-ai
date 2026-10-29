export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": url.origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (url.pathname !== "/api/chat") return new Response("Not found", { status: 404 });
    if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });

    let body;
    try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: "JSON tidak valid" }), { status: 400, headers: cors }); }
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) return new Response(JSON.stringify({ error: "Pesan tidak boleh kosong" }), { status: 400, headers: cors });
    if (message.length > 4000) return new Response(JSON.stringify({ error: "Pesan maksimal 4000 karakter" }), { status: 413, headers: cors });
    if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({ error: "GEMINI_API_KEY belum dikonfigurasi" }), { status: 503, headers: cors });

    try {
      const model = env.GEMINI_MODEL || "gemini-2.5-flash";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "Kamu adalah Nusa AI, asisten yang ramah dan membantu dalam bahasa Indonesia. Jawab dengan jelas, berguna, dan terstruktur. Jangan mengaku bisa melakukan tindakan yang belum dilakukan." }] },
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 900 }
        })
      });
      const data = await response.json();
      if (!response.ok) return new Response(JSON.stringify({ error: "Provider AI menolak permintaan", details: data.error?.message || "Periksa API key, kuota, dan nama model." }), { status: 502, headers: cors });
      const reply = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
      return new Response(JSON.stringify({ reply: reply || "Maaf, AI belum memberikan jawaban." }), { headers: cors });
    } catch {
      return new Response(JSON.stringify({ error: "Tidak dapat menghubungi provider AI." }), { status: 502, headers: cors });
    }
  }
};
