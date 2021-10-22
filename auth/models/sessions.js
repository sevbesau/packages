const mongoose = require('mongoose');

const { ObjectId } = require('mongoose').Types;

const Schema = new mongoose.Schema({
  // TODO log more info -> ip, useragent, etc
  user: { type: ObjectId, ref: 'users' },
  active: { type: Boolean, default: true },
  /*
  ip
  ua
  country
  method (email)
  */
}, {
  timestamps: true, // creates createdAt and updatedAt
});

const Model = mongoose.model('sessions', Schema);
module.exports = Model;
