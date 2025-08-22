import { generateAIResponse } from '../services/ai.service.js';
import { chatAI } from '../services/ai.service.js';

export async function generate(req, res) {
  try {
    const { prompt, imageUrl, mode, model } = req.body || {};
    const result = await generateAIResponse({ prompt, imageUrl, mode, model });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[AI] generate error:', err);
    return res.status(400).json({ ok: false, error: err?.message || 'AI generation failed' });
  }
}

export async function chat(req, res) {
  try {
    const { messages, model } = req.body || {};
    const result = await chatAI({ messages, model });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[AI] chat error:', err);
    return res.status(400).json({ ok: false, error: err?.message || 'AI chat failed' });
  }
}
