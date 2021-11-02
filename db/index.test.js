const mongoose = require('mongoose');

const db = require('./index');

const validUri = 'mongodb://localhost:27017/testdb';
const invalidUri = 'mongodb://localhost:10/testdb';
const options = { quiet: true };

// test model and schema
const Schema = new mongoose.Schema({ name: String }, {});
const Model = mongoose.model('test', Schema);

describe('connect', () => {
  it('connects', async () => {
    await db.connect(validUri, options);
    await Model.deleteMany();
    await new Model({ name: 'test' }).save();
    const items = await Model.find().exec();
    expect(items.length).toBe(1);
    mongoose.connection.close();
  });

  it('connection failure', async () => {
    try {
      await db.connect(invalidUri, options);
    } catch (error) {
      expect(error.message).toMatch('Error: connect ECONNREFUSED');
    }
  });
});

describe('drop', () => {
  it('drop all items', async () => {
    await db.connect(validUri, options);
    await new Model({ name: 'test' }).save();
    await db.drop();
    const items = await Model.find().exec();
    expect(items.length).toBe(0);
    mongoose.connection.close();
  });
});