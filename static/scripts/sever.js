// server.js
const express = require('express');
const { generateRecommendations } = require('./chatgpt.mjs'); // 确保路径正确

const app = express();

app.get('/recommend/:destination', async (req, res) => {
  const destination = req.params.destination;
  const recommendations = await generateRecommendations(destination);
  res.json({ recommendations });
});

app.listen(3000, () => console.log('Server listening on port 3000'));