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
  const sort = searchParams.get('sort') || 'f3';
  const pn = searchParams.get('pn') || '1';
  try {
    const data = await proxyGet(`https://push2.eastmoney.com/api/qt/clist/get?fs=m:0+t:6,f:!2,m:1+t:2,f:!2&fields=f2,f3,f4,f12,f14,f15,f16,f17,f18,f62,f184&fltt=2&invt=2&pn=${pn}&pz=50&po=1&fid=${sort}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

