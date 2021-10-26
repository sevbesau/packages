# SCRIPTS
Collection of development scripts.

## Installation
```console
$ npm install @siliconminds/scripts
```

## Scripts
### generate
Generate basic scafolting for speeding up development

#### Example usage
In your project root:

```console
$ npx generate model user
```
This generate a model called user in the models folder

For more information use:
```console
$ npx generate -h
```

### addUser
Adds a new user document to the users collection of a mongodb

#### Example usage
```console
$ npx addUser -e someone@something.com -p password
```

For more options use:
```console
$ npx addUser -h
```
