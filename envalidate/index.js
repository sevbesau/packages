
/**
 * Throw an error if a key is missing from the env
 * @param {Array<String>} keys The required env keys
 * @param {String} keys The required env key
 * @returns {null}
 */
module.exports = keys => {
  if (!Array.isArray(keys)) keys = [keys];
  keys.forEach(key => {
    if (!process.env[key]) throw new Error(`Missing env var: "${key}"`)
    return null;
  });
};
