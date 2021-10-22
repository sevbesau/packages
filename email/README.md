# EMAIL
Mailjet wrapper and email templating engine

## Installation
```console
$ npm install @siliconminds/email
```

## Example usage
```javascript
const email = require('@siliconminds/email');

// connect to mailjet
email.connect(process.env.MAILJET_APIKEY_PUB, process.env.MAILJET_APIKEY_PRIV);

// set and scan the templates dir
email.templates.scanDir(path.join(__dirname, '..', 'templates', 'email'));

// send an email
const success = await email.send(mailFrom, mailTo, 'templateName', { tokenName: value });
```

## Template format
Templates are plain html files with replacable tokens.

example of a magiclink template:
```html
<h1>Hello {{firstname}},</h1>
<p>Click <a href="{{url}}">here</a> to log in to your password.</p>
<p>Good luck!</p>
```
