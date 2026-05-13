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
  try {
    const data = {
      sh: await proxyGet('https://push2.eastmoney.com/api/qt/stock/get?secid=1.000001&fields=f43,f44,f45,f46,f47,f48,f57,f58,f170,f169,f100,f102&invt=2&fltt=2'),
      sz: await proxyGet('https://push2.eastmoney.com/api/qt/stock/get?secid=0.399001&fields=f43,f44,f45,f46,f47,f48,f57,f58,f170,f169,f100,f102&invt=2&fltt=2'),
      cy: await proxyGet('https://push2.eastmoney.com/api/qt/stock/get?secid=0.399006&fields=f43,f44,f45,f46,f47,f48,f57,f58,f170,f169,f100,f102&invt=2&fltt=2')
    };
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

