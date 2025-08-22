import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const DEFAULT_MODEL = 'gemini-1.5-flash';

async function fetchImageAsBase64(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image. Status ${res.status}`);
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());
    const b64 = buffer.toString('base64');
    return { b64, mime: contentType };
  } catch (e) {
    throw new Error(`Image fetch error: ${e.message}`);
  }
}

export async function generateAIResponse({ prompt, imageUrl, mode, model = DEFAULT_MODEL }) {
  if (!genAI) {
    throw new Error('GOOGLE_API_KEY is not set in the backend environment');
  }
  if (!prompt && !imageUrl) {
    throw new Error('Provide prompt or imageUrl');
  }

  const genModel = genAI.getGenerativeModel({ model });

  const parts = [];

  // System/style prompt based on mode
  if (mode === 'summarize') {
    parts.push({ text: 'You are a concise assistant. Summarize clearly in bullet points when suitable.' });
  } else if (mode === 'vision') {
    parts.push({ text: 'You are a helpful vision assistant. Describe, extract text if visible, and answer about the image.' });
  } else {
    parts.push({ text: 'You are a helpful, brief assistant.' });
  }

  if (prompt) {
    parts.push({ text: prompt });
  }

  if (imageUrl) {
    const { b64, mime } = await fetchImageAsBase64(imageUrl);
    parts.push({ inlineData: { data: b64, mimeType: mime } });
  }

  const result = await genModel.generateContent({ contents: [{ role: 'user', parts }] });
  const response = result.response;
  const text = response.text();
  return { text };
}

// Chat-style multi-turn conversation. Frontend should send an array of messages
// like: [{ role: 'user'|'assistant', content: string, imageUrl?: string }]
export async function chatAI({ messages = [], model = DEFAULT_MODEL }) {
  if (!genAI) {
    throw new Error('GOOGLE_API_KEY is not set in the backend environment');
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages array is required');
  }

  const genModel = genAI.getGenerativeModel({ model });

  const contents = [];
  for (const m of messages) {
    const role = m.role === 'assistant' ? 'model' : 'user';
    const parts = [];
    if (m.content) parts.push({ text: m.content });
    if (m.imageUrl) {
      const { b64, mime } = await fetchImageAsBase64(m.imageUrl);
      parts.push({ inlineData: { data: b64, mimeType: mime } });
    }
    contents.push({ role, parts });
  }

  const result = await genModel.generateContent({ contents });
  const response = result.response;
  const text = response.text();
  return { text };
}
