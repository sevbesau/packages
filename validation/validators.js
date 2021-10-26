module.exports.required = value => value.toString().length > 0 ? false : 'This field is required.'; 

module.exports.minLength = len => value => value.length > len ? false : `The minimum length is ${len}`; 

module.exports.maxLength = len => value => value.length < len ? false : `The minimum length is ${len}`; 

module.exports.email = value => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                                  .test(value) ? false : 'Please enter a valid email.';
