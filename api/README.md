# API
Axios wrapper for easely calling siliconminds apis.

## Installation
```console
$ npm install @siliconminds/axios
```

## Example usage
```javascript
import Api from '@/api';

const api = new Api('http://api-base-url.com/v1');

// making calls using the api
let res = await api.get('endpoint');
let res = await api.delete('endpoint');
let res = await api.put('endpoint', data);
let res = await api.post('endpoint', data);
```

## options
Each method also accepts an optional options object argument.
This object can contain the following keys:

```javascript
{
  // request headers in key: value pairs (headername: value)
  headers: {}
  
  // a query object that will be translated into a query string: ?key1=value1&key2=value2...
  query: {}
}
```
