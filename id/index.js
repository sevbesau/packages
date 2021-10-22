
/**
 * Generated a random id
 * @param {Integer} length the desired lengt (default 20)
 * @returns {String} the generated id
 */
const generate = (length = 20) => {
  const part = () => Math.random().toString(36).substr(2);
  let id = part();
  while (id.length < length) id += part();
  return id.substr(0, length);
}

module.exports = {
  generate
};
