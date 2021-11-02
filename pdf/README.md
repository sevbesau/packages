# EMAIL
EJS template based pdf generator

## Installation
```console
$ npm install @siliconminds/pdf
```

## Example usage
*'./templates/example.pdf'*

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <h1>Hello <%= name %></h1>
  </body>
</html>
```

```javascript
const pdf = require('@siliconminds/pdf');

// load the templates in the templates dir
pdf.templates.scanDir('./templates');
// generate the example pdf
pdf.generate('expample', { name: 'world' }, '/path/to/generated/pdf')
   .then(id => console.log('generated pdf with id', id));
```

## Template format
Templates are generated using ejs, so see [ejs docs](https://ejs.co/#docs) for more information
