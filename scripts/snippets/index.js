const fs = require('fs');
const path = require('path');

const snippets = {};

fs.readdirSync(__dirname).forEach((file) => {
  if (file == 'index.js') return;
  const snippet = require(path.join(__dirname, file));
  const name = file.replace(path.extname(file), '');
  snippets[name] = snippet;
});

module.exports = snippets;
