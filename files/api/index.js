const multer = require('multer');
const path = require('path');
const fs = require('fs')

const id = require('@siliconminds/id');

module.config = {};

/**
 * initialize the file helper functions
 * @param {Object} options options object
 */
const init = options => {
  if (!options.location) throw new Error('Missings arguments');
  module.config = { ...options };
  try {
    fs.mkdirSync(options.location, { recursive: true });
  } catch (error) {
    if (error.code != 'EEXIST') console.error(error);
  }
}

/**
 * Express middleware to upload files
 * @param {Array<String>} fileTypes Allowed mimetypes of filetypes
 * @returns {Function} file upload middleware
 */
const upload = (fileTypes = false) => {
  if (!module.config.location) throw new Error('Module not initialized');

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, module.config.location)
    },
    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname);
      cb(null, `${id.generate()}${extension}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    // no types specified, do nothing
    if (!module.config.fileTypes) return cb(null, true);
    const valid = module.config.fileTypes.every(type => {
      // mimetype does not match
      if (/\//.test(type) && file.mimetype != type) return false;
      // filetype does not match
      if (!/\//.test(type) && !new RegExp(type).test(file.mimetype)) return false;
      return true;
    });
    return cb(null, valid);
  };

  return multer({ storage, fileFilter }).any();
}

/**
 * Delete a file
 * @param {String} filename name of the file
 * @returns {Boolean} indicates success
 */
const del = filename => {
  if (!module.config.location) throw new Error('Module not initialized');
  // we only want the filename, dont delete arbitrary files!!!
  filename = path.basename(filename);
  try {
    fs.rmSync(path.join(module.config.location, filename));
    return true;
  } catch (error) {
    if (!error.code == 'ENOENT') console.error(error);
    return false;
  }
};

/**
 * Get a file
 * @param {String} filename name of the file
 * @returns {Buffer} the read file
 */
const get = filename => {
  if (!module.config.location) throw new Error('Module not initialized');
  // we only want the filename, dont return arbitrary files!!!
  filename = path.basename(filename);
  try {
    return fs.readFileSync(path.join(module.config.location, filename));
  } catch (error) {
    if (!error.code == 'ENOENT') console.error(error);
    return null;
  }
}

/**
 * Replace a file
 * @param {String} original name of the original file
 * @param {String} replacement name of the new file
 * @returns {Boolean} indicates success
 */
const replace = (original, replacement) => {
  if (!module.config.location) throw new Error('Module not initialized');
  // we only want the filenames, dont replace arbitrary files!!!
  const originalPath = path.join(module.config.location, path.basename(original));
  const replacementPath = path.join(module.config.location, path.basename(replacement));
  try {
    fs.rmSync(originalPath);
    fs.renameSync(replacementPath, originalPath);
    return true;
  } catch (error) {
    console.error(error);
    return false
  }
};

module.exports = {
  init,
  upload,
  get,
  replace,
  delete: del
};
