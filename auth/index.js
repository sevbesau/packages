const express = require('express');

const middlewares = require('./middlewares');

const router = express.Router();

/**
 * Authentication router
 * @param {String} appUrl base url of the app
 * @param {String} mailsFrom email sender address
 * @returns {Object} express router
 */
const routes = (appUrl, mailsFrom) => {
  router.get('/check', middlewares.check('user'), (req, res) => res.send({ success: true }));
  router.get('/me', middlewares.check('user'), (req, res) => res.json({ success: true, user: req.user }));
  router.post('/register', middlewares.register());
  router.post('/login', middlewares.login());
  router.post('/magiclink', middlewares.generate_magiclink(appUrl, mailsFrom));
  router.get('/magiclink', middlewares.verify_magiclink());
  router.post('/pass-reset', middlewares.new_pass_reset(appUrl, mailsFrom));
  router.put('/pass-reset', middlewares.pass_reset());
  router.put('/logout', middlewares.check('user'), middlewares.logout());
  return router;
};

module.exports = routes;
