const mongoose = require('mongoose');

/**
 * Connect to a mongodb instance
 * @param {String} mongoUri mongodb connection string
 * @returns {Object} mongoose connection
 */
const connect = async (mongoUri, options = {}) => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 4000,
    });
    if (!options.quiet) console.log('[mongodb] connected');
  } catch (error) {
    if (!options.quiet)     console.error(`[mongodb] connection failed...\n${error.message}`)
    else throw error;
  }
}

/**
 * Drop all collections
 */
const drop = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.deleteMany();
    } catch (error) {
      // Sometimes this error happens, but you can safely ignore it
      if (error.message === 'ns not found') return;
      // This error occurs when you use it.todo. You can
      // safely ignore this error too
      if (error.message.includes('a background operation is currently running')) return;
      console.error(`[mongodb] failed to drop db... ${error.message}`);
    }
  }
};

module.exports = {
  connect,
  drop
};