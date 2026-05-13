const https = require('https');

function sinaGet(code) {
  return new Promise((resolve, reject) => {
    https.get(`https://hq.sinajs.cn/list=${code}`, { headers: { 'Referer': 'https://finance.sina.com.cn' } }, (res) => {
      let d = ''; res.on('data', c => d += c.toString('utf-8'));
      res.on('end', () => {
        const m = d.match(/"(.+)"/);
        resolve(m ? m[1].split(',') : []);
      });
    }).on('error', reject);
  });
}

module.exports = async (req, res) => {
  try {
    const [sh, sz, cy] = await Promise.all([
      sinaGet('sh000001'), sinaGet('sz399001'), sinaGet('sz399006')
    ]);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
      sh: { name: sh[0], price: parseFloat(sh[3]), change: parseFloat(sh[2]) ? ((parseFloat(sh[3])-parseFloat(sh[2]))/parseFloat(sh[2])*100).toFixed(2) : 0, volume: parseInt(sh[8]), amount: parseFloat(sh[9]) },
      sz: { name: sz[0], price: parseFloat(sz[3]), change: parseFloat(sz[2]) ? ((parseFloat(sz[3])-parseFloat(sz[2]))/parseFloat(sz[2])*100).toFixed(2) : 0, volume: parseInt(sz[8]), amount: parseFloat(sz[9]) },
      cy: { name: cy[0], price: parseFloat(cy[3]), change: parseFloat(cy[2]) ? ((parseFloat(cy[3])-parseFloat(cy[2]))/parseFloat(cy[2])*100).toFixed(2) : 0, volume: parseInt(cy[8]), amount: parseFloat(cy[9]) }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
