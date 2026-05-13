const https = require('https');
module.exports = async (req, res) => {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const code = searchParams.get('code');
  const market = searchParams.get('market') || '1';
  const sinaCode = market === '1' ? `sh${code}` : `sz${code}`;
  try {
    const data = await new Promise((resolve, reject) => {
      https.get(`https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=${sinaCode}&scale=240&ma=5&datalen=30`, { headers: { 'Referer': 'https://finance.sina.com.cn' } }, (res) => {
        let d = ''; res.on('data', c => d += c);
        res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve([]); } });
      }).on('error', reject);
    });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ data: { klines: (data || []).map(k => `${k.day},${k.open},${k.close},${k.high},${k.low},${k.volume},${k.money || 0}`) } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
