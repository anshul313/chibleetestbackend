/**
 * Module dependencies.
 */

var path = require('path');
var extend = require('util')._extend;

var development = require('./dev_env');
var test = require('./test_env');
var production = require('./prod_env');

var defaults = {
  root: path.normalize(__dirname+'/../'),
  mail:{
    mandrillKey : 'pwABzp6CtEQKsLD-lUNx7g',
    from : 'system@caretocall.com'
  },
  COGNITO_IDENTITY_POOL_ID:"us-east-1:c9a4b50a-939e-46fb-b011-7b2c3cf9660a",
  AWS_REGION:"us-east-1"
};

/**
 * Expose
 */

module.exports = {
  development: extend(development, defaults),
  test: extend(test, defaults),
  production: extend(production, defaults)
}[process.env.NODE_ENV || 'development'];
