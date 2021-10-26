const axios = require('axios');
const Api = require('./index');

const api_url = 'https://testapi.com';
const data = { success: true };
const headers = { auth: 'Bearer token' };
const query = { page: 1, limit: 25 };
const queryString = '?page=1&limit=25';

const api = new Api(api_url);

jest.mock('axios');

/************************
 * Error handling tests *
 ************************/

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.request = data;
  }
}

class ServerError extends Error {
  constructor(message) {
    super(message);
    this.response = { data };
  }
}

describe('api errors', () => {
  it('should catch server errors', async () => {
    axios.mockImplementationOnce(() => { throw new ServerError() })
    const res = await api.get('test');
    expect(res).toBe(data);
    console.log(res);
  });

  it('should catch network errors', async () => {
    axios.mockImplementationOnce(() => { throw new NetworkError() })
    const res = await api.get('test');
    expect(res).toBe(false);
  });

  it('should catch axios errors', async () => {
    axios.mockImplementationOnce(() => { throw new Error() })
    const res = await api.get('test');
    expect(res).toBe(false);
  });
});


/******************
 * Api call tests *
 ******************/

axios.mockResolvedValue({ data });

describe('api options', () => {
  it('should set the query string', async () => {
    await api.get('test', { query });
    const options = axios.mock.calls.pop()[0];
    
    expect(options).toStrictEqual({
      url: `${api_url}/test${queryString}`,
      method: 'get',
      data: {},
      headers: {},
      withCredentials: true,
    });

  });

  it('should set the headers', async () => {
    await api.get('test', { headers });
    const options = axios.mock.calls.pop()[0];
    
    expect(options).toStrictEqual({
      url: `${api_url}/test`,
      method: 'get',
      data: {},
      headers,
      withCredentials: true,
    });

  });
});

describe('api get', () => {
  it('get data', async () => {
    const res = await api.get('test');
    expect(res).toBe(data);
  });
  
  it('set request options', async () => {
    await api.get('test');
    const options = axios.mock.calls.pop()[0];
    
    expect(options).toStrictEqual({
      url: `${api_url}/test`,
      method: 'get',
      data: {},
      headers: {},
      withCredentials: true,
    });
  })
 
});

describe('api post', () => {
  it('post data', async () => {
    const res = await api.post('test', data);
    expect(res).toBe(data);
  });
  
  it('set request options', async () => {
    await api.post('test', data);
    const options = axios.mock.calls.pop()[0];
    
    expect(options).toStrictEqual({
      url: `${api_url}/test`,
      method: 'post',
      data,
      headers: {},
      withCredentials: true,
    });
  })
 
});

describe('api put', () => {
  it('put data', async () => {
    const res = await api.put('test/id', data);
    expect(res).toBe(data);
  });
  
  it('set request options', async () => {
    await api.put('test/id', data);
    const options = axios.mock.calls.pop()[0];
    
    expect(options).toStrictEqual({
      url: `${api_url}/test/id`,
      method: 'put',
      data,
      headers: {},
      withCredentials: true,
    });
  })
 
});

describe('api delete', () => {
  it('get data', async () => {
    const res = await api.delete('test/id');
    expect(res).toBe(data);
  });
  
  it('set request options', async () => {
    await api.delete('test/id');
    const options = axios.mock.calls.pop()[0];
    
    expect(options).toStrictEqual({
      url: `${api_url}/test/id`,
      method: 'delete',
      data: {},
      headers: {},
      withCredentials: true,
    });
  })
 
});
