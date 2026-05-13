const https = require('https');

function sinaGet(code) {
  return new Promise((resolve, reject) => {
    https.get(`https://hq.sinajs.cn/list=${code}`, { headers: { 'Referer': 'https://finance.sina.com.cn' } }, (res) => {
      let d = ''; res.on('data', c => d += c.toString('utf-8'));
      res.on('end', () => {
        const m = d.match(/"(.+)"/);
        resolve(m ? m[1] : '');
      });
    }).on('error', reject);
  });
}

module.exports = async (req, res) => {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const code = searchParams.get('code');
  const market = searchParams.get('market') || '1';
  const sinaCode = market === '1' ? `sh${code}` : `sz${code}`;
  try {
    const raw = await sinaGet(sinaCode);
    const parts = raw.split(',');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
      name: parts[0],
      close: parseFloat(parts[1]),
      open: parseFloat(parts[2]),
      price: parseFloat(parts[3]),
      high: parseFloat(parts[4]),
      low: parseFloat(parts[5]),
      volume: parseInt(parts[8]) / 100,
      amount: parseFloat(parts[9]),
      changePct: parts[2] && parts[3] ? ((parseFloat(parts[3]) - parseFloat(parts[2])) / parseFloat(parts[2]) * 100).toFixed(2) : 0
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
