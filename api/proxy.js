const https = require('https');

function proxyGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    }).on('error', reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const urlStr = req.url.startsWith('/') ? req.url : '/' + req.url;
  const parts = urlStr.split('?')[0].split('/');
  const route = parts[parts.length - 1];
  const searchParams = new URL(urlStr, `http://${req.headers.host}`).searchParams;
  const code = searchParams.get('code');
  const market = searchParams.get('market') || '1';

  try {
    let data;
    if (route === 'quote') {
      data = await proxyGet(`https://push2.eastmoney.com/api/qt/stock/get?secid=${market}.${code}&fields=f43,f44,f45,f46,f47,f48,f50,f51,f52,f57,f58,f170,f169,f15,f16,f17,f18,f100,f102&invt=2&fltt=2`);
    } else if (route === 'kline') {
      const klt = searchParams.get('klt') || '101';
      const lmt = searchParams.get('lmt') || '30';
      data = await proxyGet(`https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${market}.${code}&fields1=f1,f2,f3,f4,f5&fields2=f51,f52,f53,f54,f55,f56,f57&klt=${klt}&fqt=1&end=20500101&lmt=${lmt}`);
    } else if (route === 'sectors') {
      const type = searchParams.get('type') || '2';
      data = await proxyGet(`https://push2.eastmoney.com/api/qt/clist/get?fs=m:90+t:${type}&fields=f12,f14,f2,f3,f4,f62,f184,f20,f21,f124&fltt=2&invt=2&pn=1&pz=50`);
    } else if (route === 'moneyflow') {
      data = await proxyGet(`https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get?secid=${market}.${code}&fields1=f1,f2,f3,f7&fields2=f51,f52,f53,f54,f55,f56,f57&lmt=5`);
    } else if (route === 'market-list') {
      const sort = searchParams.get('sort') || 'f3';
      const pn = searchParams.get('pn') || '1';
      data = await proxyGet(`https://push2.eastmoney.com/api/qt/clist/get?fs=m:0+t:6,f:!2,m:1+t:2,f:!2&fields=f2,f3,f4,f12,f14,f15,f16,f17,f18,f62,f184&fltt=2&invt=2&pn=${pn}&pz=50&po=1&fid=${sort}`);
    } else if (route === 'index') {
      data = {
        sh: await proxyGet('https://push2.eastmoney.com/api/qt/stock/get?secid=1.000001&fields=f43,f44,f45,f46,f47,f48,f57,f58,f170,f169,f100,f102&invt=2&fltt=2'),
        sz: await proxyGet('https://push2.eastmoney.com/api/qt/stock/get?secid=0.399001&fields=f43,f44,f45,f46,f47,f48,f57,f58,f170,f169,f100,f102&invt=2&fltt=2'),
        cy: await proxyGet('https://push2.eastmoney.com/api/qt/stock/get?secid=0.399006&fields=f43,f44,f45,f46,f47,f48,f57,f58,f170,f169,f100,f102&invt=2&fltt=2')
      };
    } else {
      res.status(404).json({ error: 'not found' }); return;
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
