const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

/**
 * Upload a file to a specific url using formdata
 * @param {String} url the url to upload to
 * @param {fs.ReadStream} fileStream path to file
 * @returns {Object} axios response
 */
const upload = async (url, fileStream, token = false) => {
  const formData = new FormData()
  formData.append('file', fileStream);
  const options = { headers: formData.getHeaders() }
  if (token) options.headers.Authorization = `Bearer ${token}`;
  const res = await axios.post(url, formData, options);
  return res;
};

module.exports = {
  upload,
};
