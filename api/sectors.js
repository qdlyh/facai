const https = require('https');
function proxyGet(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    opts.headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Referer': 'https://push2.eastmoney.com/' };
    https.get(opts, (res) => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    }).on('error', reject);
  });
}
module.exports = async (req, res) => {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const type = searchParams.get('type') || '2';
  try {
    const data = await proxyGet(`https://push2.eastmoney.com/api/qt/clist/get?fs=m:90+t:${type}&fields=f12,f14,f2,f3,f4,f62,f184,f20,f21,f124&fltt=2&invt=2&pn=1&pz=50`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

