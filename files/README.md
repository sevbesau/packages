# FILES
File upload middlewares and helpers

## Installation
```console
$ npm install @siliconminds/files
```

## Example usage
### Client
Upload a file

```javascript
const fs = require('fs/promises');
const files = require('@siliconminds/files/client');

const fileStream = await fs.createReadStream('path/to/file');

const res = await files.upload('http://upload.com', fileStream);
```

### Server
File routes

```javascript
const express = require('express');

const files = require('@siliconminds/files/api');

require('@siliconminds/envalidate')('uploads_dir');

const router = express.Router();

files.init({ location: process.env.uploads_dir });

// upload a file
router.post('/', files.upload(['image/jpeg']), (req, res) => {
  res.json(req.files);
});

// get a file
router.get('/:filename', (req, res) => {
  const file = files.get(req.params.filename);
  if (!file) return res.status(404).send('File not found');
  res.send(file);
});

// delete a file
router.delete('/:filename', (req, res) => {
  const success = files.delete(req.params.filename);
  if (!success) return res.status(404).send('File not found');
  res.send(success);
});

module.exports = router;

```
