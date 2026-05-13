const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3456;

app.use(express.static(__dirname));

const apiFiles = ['quote', 'kline', 'index-data', 'sectors', 'moneyflow', 'market-list'];
apiFiles.forEach(name => {
  const route = name === 'index-data' ? '/api/index' : `/api/${name}`;
  app.use(route, require(`./api/${name}`));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`恭喜发财分析台 → http://localhost:${PORT}`);
});
