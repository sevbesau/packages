const axios = require('axios');

class Api {
  /**
   * Create an api instance
   * @param {String} api_url base url of the api
   * @param {String} token auth token
   */
  constructor(api_url, token = false) {
    if (process.env.NODE_ENV !== 'development' && !/^https/.test(api_url)) throw new Error('Only https is allowed outside development!');
    this.api_url = api_url;
    this.token = token;

    if (!Api._instance) {
      Api._instance = this;
    }
    return Api._instance;
  }

  /**
   * Make a http request to a server
   * @param {String} method request method
   * @param {String} endpoint request endpoint
   * @param {T} data request payload
   * @param {T} options extra options
   * @returns {T} The server response
   */
  async request(method, endpoint = '', data = {}, options = false) {
    // build the headers
    let headers = {};
    if (options.headers) headers = { ...options.headers };

    // build the query string
    let query = '';
    if (options && options.query) {
      query = `?${Object.keys(options.query)
        .map((key) => `${key}=${options.query[key]}`)
        .join('&')}`;
    }

    let result;
    try {
      const res = await axios({
        url: `${this.api_url}/${endpoint}${query}`,
        method,
        data,
        headers,
        withCredentials: true,
      });
      result = res.data;
    } catch (error) {
      if (error.response) {
        // server responded with non 2xx status
        result = error.response.data;
      } else if (error.request) {
        // no response was recieved
        result = false;
      } else {
        // setting up the request failed
        console.error(error);
      }
    }
    return result;
  }

  /**
   * Make a get call
   * @param {String} endpoint request endpoint
   * @returns {T} server response
   */
  async get(endpoint, options = {}) {
    return this.request('get', endpoint, {}, options);
  }

  /**
   * Make a post call
   * @param {String} endpoint request endpoint
   * @param {T} data request payload
   * @returns {T} server response
   */
  async post(endpoint, data, options = {}) {
    return this.request('post', endpoint, data, options);
  }

  /**
   * Make a put call
   * @param {String} endpoint request endpoint
   * @param {T} data request payload
   * @returns {T} server response
   */
  async put(endpoint, data, options = {}) {
    return this.request('put', endpoint, data, options);
  }

  /**
   * Make a delete call
   * @param {String} endpoint request endpoint
   * @returns {T} server response
   */
  async delete(endpoint, options = {}) {
    return this.request('delete', endpoint, {}, options);
  }
}

module.exports = Api;
