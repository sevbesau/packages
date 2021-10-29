const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  blocked: { type: Boolean, default: false },
  roles: {
    type: Array,
    default: ['user']
  }, 
  resetTokens: [String],
  lastActive: Date,
}, {
  timestamps: true, // creates createdAt and updatedAt
});

const Model = mongoose.model('users', Schema);
module.exports = Model;
