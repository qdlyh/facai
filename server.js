const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3456;

app.use(express.static(__dirname));

const proxyHandler = require('./api/proxy');
app.use('/api', proxyHandler);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`恭喜发财分析台 → http://localhost:${PORT}`);
});
