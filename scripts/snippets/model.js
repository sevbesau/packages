module.exports = `const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  // PUT FIELDS HERE
}, {
  timestamps: true,
});

const Model = mongoose.model('{{name}}', Schema);
module.exports = Model;
`;
