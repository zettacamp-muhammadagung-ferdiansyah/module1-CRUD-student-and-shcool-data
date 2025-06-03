// *************** IMPORT CORE ***************
const express = require('express');

// *************** INITIALIZE APP ***************
const app = express();
const PORT = process.env.PORT || 3000;

// *************** ROOT ROUTE ***************
app.get('/', (req, res) => {
  res.json({ message: 'Express server is up and running!' });
});

// *************** START SERVER ***************
app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`);
});