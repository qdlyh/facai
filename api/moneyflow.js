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
    const data = await proxyGet(`https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get?secid=${market}.${code}&fields1=f1,f2,f3,f7&fields2=f51,f52,f53,f54,f55,f56,f57&lmt=5`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
