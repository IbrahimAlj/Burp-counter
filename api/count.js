export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  // Debug: tell us what env vars exist
  if (!url || !token) {
    const keys = Object.keys(process.env).filter(k =>
      k.includes('UPSTASH') || k.includes('KV') || k.includes('REDIS')
    );
    return res.status(500).json({ error: 'Redis not configured', found_keys: keys });
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
