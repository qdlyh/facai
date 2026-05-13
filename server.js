const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3456;

app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));

const proxyHandler = require('./api/proxy');
app.use('/api', proxyHandler);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`阿狼策略分析台 → http://localhost:${PORT}`);
});
