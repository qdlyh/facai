const data = { data: { diff: [
  { f12:'BK1027',f14:'半导体',f3:1.2,f62:520000 },
  { f12:'BK1030',f14:'AI',f3:2.1,f62:380000 },
  { f12:'BK1035',f14:'航天',f3:0.8,f62:210000 },
  { f12:'BK1040',f14:'存储',f3:1.5,f62:180000 },
  { f12:'BK1050',f14:'锂电',f3:-0.3,f62:-50000 },
]}};
module.exports = (req, res) => { res.setHeader('Access-Control-Allow-Origin', '*'); res.json(data); };
