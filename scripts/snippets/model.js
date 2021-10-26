module.exports = `const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  // PUT FIELDS HERE
}, {
  timestamps: true,
});


/*
// validate
Schema.pre('validate', function () {
  console.log('pre validate');
});
Schema.post('validate', function () {
  console.log('post validate');
});

// find
Schema.pre('find', function () {
  console.log('pre find');
});
Schema.post('find', function () {
  console.log('post find');
});

// findOne
Schema.pre('findOne', function () {
  console.log('pre findOne');
});
Schema.post('findOne', function () {
  console.log('post findOne');
});

// save
Schema.pre('save', function () {
  console.log('pre save');
});
Schema.post('save', function () {
  console.log('post save');
});

// update
Schema.pre('update', function () {
  console.log('pre update');
});
Schema.post('update', function () {
  console.log('post update');
});
Schema.pre('updateOne', function () {
  console.log('pre updateOne');
});
Schema.post('updateOne', function () {
  console.log('post updateOne');
});

// delete
Schema.pre('delete', function () {
  console.log('pre delete');
});
Schema.post('delete', function () {
  console.log('post delete');
});
*/




const Model = mongoose.model('{{name}}', Schema);
module.exports = Model;
`;
