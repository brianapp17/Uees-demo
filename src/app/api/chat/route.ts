import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    // Usando la API key en el parámetro de consulta como lo requiere Gemini REST API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const systemInstructionText = `
Eres el asistente virtual de la plataforma "UEES Educación a Distancia" (Universidad Evangélica de El Salvador).
Tu objetivo es responder de forma amable, profesional y precisa utilizando el contexto proporcionado sobre los registros actuales del usuario.
Si el usuario pregunta "cuántos alumnos tengo", o "a qué hora es mi clase", debes extraer la respuesta exclusivamente de esta información de contexto:

--- CONTEXTO DEL USUARIO ---
${context}
--- FIN DEL CONTEXTO ---

Si el usuario te hace una pregunta que no se puede responder con el contexto proporcionado, indícale amablemente que no tienes esa información a la mano.
Responde de forma conversacional y directa, sin mostrar formatos extraños.
    `;

    // Convert messages to Gemini format
    const formattedContents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents: formattedContents,
      generationConfig: {
        temperature: 0.3,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return NextResponse.json({ error: 'Error calling Gemini API' }, { status: response.status });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta.";

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
