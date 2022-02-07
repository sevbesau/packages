const db = require('@siliconminds/db');
const email = require('@siliconminds/email');
const id = require('@siliconminds/id');
const express = require('express');
const request = require('supertest');
const cookieParser = require('cookie-parser');

const auth = require('./index');
const middlewares = require('./middlewares');
const Users = require('./models/users');
const Sessions = require('./models/sessions');

// defenitions
const testUser = {
  firstname: 'seppe',
  lastname: 'vbs',
  email: 'seppe@sevbesau.xyz',
  password: '1234'
};
const testId = '5ecchrt6qk6jr17ad8up';
const mailsFrom = 'test@test.com';
const appUrl = 'https://app.test.com';

// app setup
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/', auth(appUrl, mailsFrom));
app.use('/no-roles', middlewares.check(), (req, res) => res.json({ success: true }));

// agent for making requests to the app
const agent = request.agent(app);

// mock setup
jest.mock('@siliconminds/email');
jest.mock('@siliconminds/id');
id.generate.mockReturnValue(testId);

// connect to and clean the database before each
beforeEach(async () => {
  await db.connect('mongodb://127.0.0.1:27017/testdb', { quiet: true });
  await db.drop();
});

describe('[GET] /check', () => {
  it('cookie access', async () => {
    // register a user
    await agent
      .post('/register')
      .send(testUser);

    // log the user in
    const login = await agent
      .post('/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    // get the auth cookie
    const authCookie = decodeURIComponent(login.header['set-cookie']);

    // check login using auth cookie
    const res = await agent
      .get('/check')
      .set('Cookie', [authCookie])
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: true });
    expect(res.status).toBe(200);
  });

  it('header access', async () => {
    // register a user
    await agent
      .post('/register')
      .send(testUser);

    // log the user in
    const login = await agent
      .post('/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    // get the auth token
    const authCookie = decodeURIComponent(login.header['set-cookie'][0]);
    const token = authCookie.split(';')[0].split(' ')[1]

    // check login using auth cookie
    const res = await agent
      .get('/check')
      .set('Authorization', `Bearer ${token}`)
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: true });
    expect(res.status).toBe(200);
  });

  it('wrong cookie format', async () => {
    // check login using auth cookie
    const res = await agent
      .get('/check')
      .set('Cookie', ['authorization=wrong'])
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'invalid auth format' });
    expect(res.status).toBe(400);
  });

  it('wrong header format', async () => {
    const res = await agent
      .get('/check')
      .set('Authorization', 'wrong')
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'invalid auth format' });
    expect(res.status).toBe(400);
  });

  it('invalid cookie token length', async () => {
    // check login using auth cookie
    const res = await agent
      .get('/check')
      .set('Cookie', ['authorization=Bearer invalid'])
      .send();

    // check the response
    const authCookie = decodeURIComponent(res.header['set-cookie'][0]);
    expect(authCookie).toMatch(/^authorization=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT/)
    expect(res.body).toStrictEqual({ success: false, error: 'invalid auth token' });
    expect(res.status).toBe(400);
  });

  it('invalid header token length', async () => {
    // check login using auth cookie
    const res = await agent
      .get('/check')
      .set('Authorization', 'Bearer invalid')
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'invalid auth token' });
    expect(res.status).toBe(400);
  });

  it('invalid cookie token', async () => {
    // check login using auth cookie
    const res = await agent
      .get('/check')
      .set('Cookie', ['authorization=Bearer 617ace3d55236bf3358eb016'])
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'invalid token' });
    expect(res.status).toBe(400);
  });

  it('invalid header token', async () => {
    // check login using auth cookie
    const res = await agent
      .get('/check')
      .set('Authorization', 'Bearer 617ace3d55236bf3358eb016')
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'invalid token' });
    expect(res.status).toBe(400);
  });

  it('insufficient roles', async () => {
    // register a user
    await agent
      .post('/register')
      .send(testUser);

    // update the users roles
    await Users.updateOne({ email: testUser.email }, { roles: [] }).exec();

    // log the user in
    const login = await agent
      .post('/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    // get the auth cookie
    const authCookie = decodeURIComponent(login.header['set-cookie']);

    // check login using auth cookie
    const res = await agent
      .get('/check/admin')
      .set('Cookie', [authCookie])
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'insufficient permissions' });
    expect(res.status).toBe(403);
  });

  it('no roles', async () => {
    // register a user
    await agent
      .post('/register')
      .send(testUser);

    // log the user in
    const login = await agent
      .post('/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    // get the auth cookie
    const authCookie = decodeURIComponent(login.header['set-cookie']);

    // check login using auth cookie
    const res = await agent
      .get('/no-roles')
      .set('Cookie', [authCookie])
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: true });
    expect(res.status).toBe(200);
  });
});

describe('[GET] /me', () => {
  it('get user', async () => {
    // register a user
    await agent
      .post('/register')
      .send(testUser);

    // log the user in
    const login = await agent
      .post('/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    // get the auth cookie
    const authCookie = decodeURIComponent(login.header['set-cookie']);

    // get the user
    const res = await agent
      .get('/me')
      .set('Cookie', [authCookie])
      .send();

    // check the response
    expect(res.body).toMatchObject({
      success: true,
      user: {
        firstname: testUser.firstname,
        lastname: testUser.lastname,
        email: testUser.email,
        roles: [],
      },
    });
    expect(res.status).toBe(200);
  });
  it('no auth', async () => {
    const res = await agent
      .get('/me')
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'no auth token set' });
    expect(res.status).toBe(400);
  });
});

describe('[POST] /register', () => {
  it('register', async () => {
    // register the user
    const res = await agent
      .post('/register')
      .send(testUser);

    // was the user created?
    const user = await Users.findOne({ email: testUser.email }).exec();
    expect(user).toBeTruthy();
    ['firstname', 'lastname', 'email'].forEach(key => {
      expect(user[key]).toBe(testUser[key]);
    });
    expect(user.roles).toStrictEqual([]);

    // check the response
    expect(res.body).toStrictEqual({ success: true });
    expect(res.status).toBe(200);
  });

  it('missing information', async () => {
    const res = await agent
      .post('/register')
      .send({});
    expect(res.body).toStrictEqual({
      success: false,
      error: 'not all fields are set'
    });
    expect(res.status).toBe(400);
  });

  it('duplicate user', async () => {
    // create the first user
    await agent
      .post('/register')
      .send(testUser);
    // try to recreate the user
    const res = await agent
      .post('/register')
      .send(testUser);
    expect(res.body).toStrictEqual({
      success: false,
      error: 'user with this email exists'
    });
    expect(res.status).toBe(409);
  });
})

describe('[POST] /login', () => {
  it('log in', async () => {
    // register the user
    await agent
      .post('/register')
      .send(testUser);

    // log the user in
    const res = await agent
      .post('/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    // was a session created?
    const sessions = await Sessions.find().exec();
    expect(sessions.length).toBeGreaterThanOrEqual(1);
    // TODO test session props

    // check the cookie
    const authCookie = decodeURIComponent(res.header['set-cookie'][0]);
    expect(authCookie).toMatch(/^authorization=Bearer [^;]+; Path=\/; HttpOnly; Secure/)
    const token = authCookie.split(';')[0].split(' ')[1];
    expect(token).toBe(sessions[0]._id.toString())

    // check the response
    expect(res.body).toStrictEqual({ success: true });
    expect(res.status).toBe(200);
  });

  it('missing information', async () => {
    const res = await agent
      .post('/login')
      .send({});
    expect(res.body).toStrictEqual({
      success: false,
      error: 'not all fields are set'
    });
    expect(res.status).toBe(400);
  });

  it('unknown user', async () => {
    const res = await agent
      .post('/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    expect(res.body).toStrictEqual({
      success: false,
      error: 'user not found'
    });
    expect(res.status).toBe(400);
  });

  it('wrong password', async () => {
    // register the user
    await agent
      .post('/register')
      .send(testUser);
    // log the user in
    const res = await agent
      .post('/login')
      .send({
        email: testUser.email,
        password: 'wrond'
      });
    expect(res.body).toStrictEqual({
      success: false,
      error: 'incorrect password'
    });
    expect(res.status).toBe(403);
  });
});

describe('[POST] /magiclink', () => {
  it('sends a magiclink email', async () => {
    // mock sending the email
    email.send.mockResolvedValueOnce(true);

    // register the user
    await agent
      .post('/register')
      .send(testUser);

    // log the user in
    const res = await agent
      .post('/magiclink')
      .send({
        email: testUser.email,
      });

    // was a session created?
    // TODO test session props
    const session = await Sessions.findOne({ email: testUser.email }).populate('user').exec();
    expect(session).toBeTruthy();

    // check the email args
    const emailArgs = email.send.mock.calls.pop();
    expect(emailArgs).toEqual([
      mailsFrom,
      session.user.email,
      'magic_link',
      {
        url: `${appUrl}/auth/magic-link/${session._id}`,
        firstname: session.user.firstname
      }
    ]);

    // check the response
    expect(res.body).toStrictEqual({ success: true, message: 'mail is on its way, check your inbox!' });
    expect(res.status).toBe(200);
  });

  it('missing information', async () => {
    // log the user in
    const res = await agent
      .post('/magiclink')
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'email is required' });
    expect(res.status).toBe(400);
  });

  it('unknown user', async () => {
    // mock sending the email
    email.send.mockResolvedValue(true);

    // log the user in
    const res = await agent
      .post('/magiclink')
      .send({
        email: testUser.email,
      });

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'user not found' });
    expect(res.status).toBe(400);
  });
});

describe('[GET] /magiclink', () => {
  it('log in', async () => {
    // register the user
    await agent
      .post('/register')
      .send(testUser);

    // create magiclink and session
    await agent
      .post('/magiclink')
      .send({
        email: testUser.email,
      });

    // find the sessio
    const session = await Sessions.findOne({ email: testUser.email }).populate('user').exec();

    // check magiclink
    const res = await agent
      .get('/magiclink')
      .set('Authorization', `Bearer ${session._id}`)
      .send();

    // check the cookie
    authCookie = decodeURIComponent(res.header['set-cookie'][0]);
    expect(authCookie).toBe(`authorization=Bearer ${session._id}; Path=/; HttpOnly; Secure`)

    // check the response
    expect(res.body).toStrictEqual({ success: true });
    expect(res.status).toBe(200);
  });

  it('missing header', async () => {
    const res = await agent
      .get('/magiclink')
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'no auth token set' });
    expect(res.status).toBe(400);
  });

  it('wrong header format', async () => {
    const res = await agent
      .get('/magiclink')
      .set('Authorization', 'wrong')
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'invalid auth format' });
    expect(res.status).toBe(400);
  });

  it('invalid token length', async () => {
    const res = await agent
      .get('/magiclink')
      .set('Authorization', 'Bearer invalid')
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'invalid auth token' });
    expect(res.status).toBe(400);
  });

  it('invalid token', async () => {
    const res = await agent
      .get('/magiclink')
      .set('Authorization', 'Bearer 617ace3d55236bf3358eb016')
      .send();

    // check the response
    expect(res.body).toStrictEqual({ success: false, error: 'invalid auth token' });
    expect(res.status).toBe(400);
  });
});

describe('[POST] /pass-reset', () => {
  it('create pass reset', async () => {
    // mock sending the email
    email.send.mockResolvedValue(true);

    // register the user
    await agent
      .post('/register')
      .send(testUser);

    // create passreset
    const res = await agent
      .post('/pass-reset')
      .send({
        email: testUser.email,
      });

    // check if the user has a pass reset token
    const user = await Users.findOne({ email: testUser.email }).exec();
    expect(user.resetTokens.length).toBeGreaterThanOrEqual(1);
    expect(user.resetTokens[0]).toBe(testId);

    // check the email args
    const emailArgs = email.send.mock.calls.pop();
    expect(emailArgs).toEqual([
      mailsFrom,
      testUser.email,
      'pass_reset',
      {
        url: `${appUrl}/auth/reset-password/${testId}`,
        firstname: testUser.firstname
      }
    ]);

    // check the response
    expect(res.body).toStrictEqual({
      success: true,
      message: 'mail is on its way, check your inbox!',
    });
    expect(res.status).toBe(200);
  })

  it('missing information', async () => {
    const res = await agent
      .post('/pass-reset')
      .send();

    expect(res.body).toStrictEqual({
      success: false,
      error: 'not all fields are set'
    });
    expect(res.status).toBe(400);
  });

  it('unknown user', async () => {
    const res = await agent
      .post('/pass-reset')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.body).toStrictEqual({
      success: false,
      error: 'user with this email does not exist'
    });
    expect(res.status).toBe(404);
  });
});

describe('[PUT] /pass-reset', () => {
  it('update the password', async () => {
    // register the user
    await agent
      .post('/register')
      .send(testUser);

    let user = await Users.findOne({ email: testUser.email }).exec();
    const originalPasswordHash = user.password;

    // create passreset
    await agent
      .post('/pass-reset')
      .send({
        email: testUser.email,
      });

    // update the password
    const res = await agent
      .put('/pass-reset')
      .send({
        token: testId,
        password: '5678',
      });

    // check if the hash changed
    user = await Users.findOne({ email: testUser.email }).exec();
    expect(user.password).not.toBe(originalPasswordHash);

    // check the response
    expect(res.body).toStrictEqual({ success: true });
    expect(res.status).toBe(200);
  });

  it('missing information', async () => {
    const res = await agent
      .put('/pass-reset')
      .send();

    expect(res.body).toStrictEqual({
      success: false,
      error: 'not all fields are set'
    });
    expect(res.status).toBe(400);
  });

  it('invalid token', async () => {
    const res = await agent
      .put('/pass-reset')
      .send({
        token: 'invalid',
        password: '4567'
      });

    expect(res.body).toStrictEqual({
      success: false,
      error: 'invalid token... dont hack us, join us!',
    });
    expect(res.status).toBe(403);
  });
});

describe('[PUT] /logout', () => {
  it('log out', async () => {

    // register the user
    await agent
      .post('/register')
      .send(testUser);

    // create a session
    const login = await agent
      .post('/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    // get the auth cookie
    const authCookie = decodeURIComponent(login.header['set-cookie']);

    // check login using auth cookie
    const res = await agent
      .put('/logout')
      .set('Cookie', [authCookie])
      .send();

    // was the session ended
    const sessions = await Sessions.findOne().exec();
    expect(sessions.active).toBe(false);

    // check the response
    expect(res.body).toStrictEqual({ success: true });
    expect(res.status).toBe(200);
  });
});

describe('check arguments', () => {
  it('magiclink', () => {
    try {
      middlewares.generate_magiclink()
    } catch (error) {
      expect(error.message).toBe('Missing arguments');
    }
  });
  it('pass_reset', () => {
    try {
      middlewares.new_pass_reset()
    } catch (error) {
      expect(error.message).toBe('Missing arguments');
    }
  });

});

