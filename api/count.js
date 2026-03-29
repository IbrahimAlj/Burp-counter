import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  try {
    if (action === 'hit') {
      const val = await kv.incr('burp-count');
      return res.json({ value: val });
    }
    if (action === 'reset') {
      await kv.set('burp-count', 0);
      return res.json({ value: 0 });
    }
    if (action === 'decr') {
      const current = await kv.get('burp-count') || 0;
      const val = Math.max(0, current - 1);
      await kv.set('burp-count', val);
      return res.json({ value: val });
    }
    // Default: get
    const val = await kv.get('burp-count') || 0;
    return res.json({ value: val });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
