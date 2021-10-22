# AUTH
Authentication routes and middlewares.

## Installation
```console
$ npm install @siliconminds/auth
```

## Example usage
Add the authentication routes to your server:

```javascript
const express = require('express');
const auth = require('@siliconminds/auth');

require('@siliconminds/envalidate')(['APP_URL', 'MAILS_FROM']);

const router = express.Router();

router.use('/', auth(process.env.APP_URL, process.env.MAILS_FROM));

module.exports = router;

```

Protect a route:
```javascript
const express = require('express');
const auth = require('@siliconminds/auth/middlewares');

const router = express.Router();

router.get('/auth', auth.check('user'), (req, res) => res.send('pong'));

module.exports = router;

```
