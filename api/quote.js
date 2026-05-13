const https = require('https');
function proxyGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    }).on('error', reject);
  });
}
module.exports = async (req, res) => {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const code = searchParams.get('code');
  const market = searchParams.get('market') || '1';
  try {
    const data = await proxyGet(`https://push2.eastmoney.com/api/qt/stock/get?secid=${market}.${code}&fields=f43,f44,f45,f46,f47,f48,f50,f51,f52,f57,f58,f170,f169,f15,f16,f17,f18,f100,f102&invt=2&fltt=2`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
