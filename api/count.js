export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: 'Redis not configured' });
  }

  const r = (cmd) => fetch(`${url}/${cmd}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  const { action } = req.query;
  try {
    if (action === 'hit')   return res.json({ value: (await r('incr/burp-count')).result });
    if (action === 'decr')  return res.json({ value: (await r('decr/burp-count')).result });
    if (action === 'reset') { await r('set/burp-count/0'); return res.json({ value: 0 }); }
    return res.json({ value: (await r('get/burp-count')).result || 0 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
