// *************** IMPORT CORE ***************
const express = require('express');

// *************** INITIALIZE APP ***************
const app = express();
const PORT = process.env.PORT || 3000;

// *************** ROOT ROUTE ***************
app.get('/', (req, res) => {
  res.send('Hello, Express server is running!');
});

// *************** START SERVER ***************
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});