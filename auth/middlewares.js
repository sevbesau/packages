const bcrypt = require('bcryptjs');
const email = require('@siliconminds/email');
const id = require('@siliconminds/id');

const { ObjectId } = require('mongoose').Types;

const Sessions = require('./models/sessions');
const Users = require('./models/users');

/**
 * Check if the user is authenticated and has the proper roles
 * Allows tokens in the cookies and the header (cookies > headers)
 * @param {Array<String>} roles roles the user must have
 * @returns {function} express middleware
 */
const check = roles => {
  return async function (req, res, next) {
    if (!roles) roles = ['user'];
    if (!(req.cookies && req.cookies.authorization) && !req.headers.authorization)
      return res.status(400).json({ success: false, error: 'no auth token set' });
    if (!/Bearer /.test(req.cookies.authorization) && !/Bearer /.test(req.headers.authorization))
      return res.status(400).json({ success: false, error: 'invalid auth format' });
    const token = (req.cookies.authorization || req.headers.authorization).replace('Bearer ', '');
    if (!ObjectId.isValid(token)) {
      if (req.cookies.authorization) res.clearCookie('authorization');
      return res.status(400).json({ success: false, error: 'invalid auth token' })
    }
    const session = await Sessions.findOne({ _id: token, active: true }).populate('user').exec();
    if (!session) {
      if (req.cookies.authorization) res.clearCookie('authorization');
      return res.status(400).json({ success: false, error: 'invalid token' });
    }
    if (!Array.isArray(roles)) roles = [roles];
    if (roles.some(role => !session.user.roles.includes(role)))
      return res.status(403).json({ success: false, error: 'insufficient permissions' });
    req.session = session._id;
    req.user = {
      firstname:  session.user.firstname,
      lastname:   session.user.lastname,
      email:      session.user.email,
      roles:      session.user.roles,
      lastActive: session.user.lastActive,
    };
    return next();
  };
};

/**
 * Send a magic link email to the user
 * @param {String} appUrl baseUrl of the app
 * @param {String} mailsFrom Email sender
 * @returns {function} express middleware
 */
const generate_magiclink = (appUrl, mailsFrom) => {
  if (!appUrl || !mailsFrom) throw new Error('Missing arguments');
  return async function (req, res, next) {
    if (!req.body.email)
      return res.status(400).json({ success: false, error: 'email is required' });
    const user = await Users.findOne({ email: req.body.email }).exec();
    if (!user || !user._id)
      return res.status(400).json({ success: false, error: 'user not found' });
    const session = await new Sessions({ user: user._id }).save();
    const url = `${appUrl}/auth/magic-link/${session._id}`;
    const success = await email.send(mailsFrom, user.email, 'magic_link', { url, firstname: user.firstname });
    if (!success) return res.status(500).json({ success, message: 'something went wrong, please try again later!' })
    return res.json({ success, message: 'mail is on its way, check your inbox!' });
  };
};

/**
 * Verify the token from a magiclink login
 * @returns {function} express middleware
 */
const verify_magiclink = () => {
  return async function (req, res, next) {
    if (!req.headers.authorization)
      return res.status(400).json({ success: false, error: 'no auth token set' });
    if (!/Bearer /.test(req.headers.authorization))
      return res.status(400).json({ success: false, error: 'invalid auth format' });
    const token = (req.headers.authorization).replace('Bearer ', '');
    if (!ObjectId.isValid(token))
      return res.status(400).json({ success: false, error: 'invalid auth token' })
    const session = await Sessions.findOne({ _id: token, active: true }).populate('user').exec();
    if (!session)
      return res.status(400).json({ success: false, error: 'invalid auth token' })
    return res.cookie('authorization', `Bearer ${session._id}`, {
      httpOnly: true,
      secure: true,
    }).json({ success: true });

  };
};

/**
 * Register a new user
 * @returns {function} express middleware
 */
const register = () => {
  return async function (req, res, next) {
    if (!req.body.email || !req.body.password)
      return res.status(400).json({ success: false, error: 'not all fields are set' });
    const user = await Users.findOne({ email: req.body.email }).exec();
    if (user)
      return res.status(409).json({ success: false, error: 'user with this email exists' });
    const password = await bcrypt.hash(req.body.password, 8);
    delete req.body.roles;
    await new Users({
      ...req.body,
      password,
    }).save();
    return res.status(200).json({ success: true });
  };
};

/**
 * Create a new password reset token
 * @returns {function} express middleware
 */
const new_pass_reset = (appUrl, mailsFrom) => {
  if (!appUrl || !mailsFrom) throw new Error('Missing arguments');
  return async function (req, res, next) {
    if (!req.body.email)
      return res.status(400).json({ success: false, error: 'not all fields are set' });
    const user = await Users.findOne({ email: req.body.email }).exec();
    if (!user)
      return res.status(404).json({ success: false, error: 'user with this email does not exist' });
    const token = id.generate(20);
    await Users.updateOne({ email: req.body.email }, { $push: { resetTokens: token } }).exec();
    const url = `${appUrl}/auth/reset-password/${token}`;
    const success = await email.send(mailsFrom, req.body.email, 'pass_reset', { url, firstname: user.firstname });
    if (!success) return res.status(500).json({ success, message: 'something went wrong, please try again later!' })
    return res.status(200).json({ success, message: 'mail is on its way, check your inbox!' });
  };
};

/**
 * Reset a users password
 * @returns {function} express middleware
 */
const pass_reset = () => {
  return async function (req, res, next) {
    if (!req.body.token || !req.body.password)
      return res.status(400).json({ success: false, error: 'not all fields are set' });
    const user = await Users.findOne({ resetTokens: req.body.token }).exec();
    if (!user)
      return res.status(403).json({ success: false, error: 'invalid token... dont hack us, join us!' });
    const password = await bcrypt.hash(req.body.password, 8);
    await Users.updateOne({ resetTokens: req.body.token }, { password, resetTokens: [] }).exec();
    return res.status(200).json({ success: true });
  };
};

/**
 * Log a user in
 * @returns {function} express middleware
 */
const login = () => {
  return async function (req, res, next) {
    if (!req.body.email || !req.body.password)
      return res.status(400).json({ success: false, error: 'not all fields are set' });
    const user = await Users.findOne({ email: req.body.email }).exec();
    if (!user || !user._id)
      return res.status(400).json({ success: false, error: 'user not found' });
    if (!(await bcrypt.compare(req.body.password, user.password)))
      return res.status(403).json({ success: false, error: 'incorrect password' });
    const session = await new Sessions({ user: user._id }).save();
    res.cookie('authorization', `Bearer ${session._id}`, {
      httpOnly: true,
      secure: true,
    });
    return res.json({ success: true });
  };
};

/**
 * Log a user out
 * @returns {function} express middleware
 */
const logout = () => {
  return async function (req, res, next) {
    await Sessions.updateOne({ _id: req.session }, { $set: { active: false } });
    return res.json({ success: true });
  };
};

module.exports = {
  check,
  generate_magiclink,
  verify_magiclink,
  register,
  new_pass_reset,
  pass_reset,
  login,
  logout,
};
