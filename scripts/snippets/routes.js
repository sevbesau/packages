module.exports = {
  router: `const express = require('express');

const auth = require('@siliconminds/auth/middlewares');

const router = express.Router();
  
router.use(auth.check({{roles}}));

// PUT ROUTES HERE

module.exports = router;
`,
//-------------------------------------------------------//
  crud: `const express = require('express');

const auth = require('@siliconminds/auth/middlewares');

const { {{model}} } = require('@/models');

const router = express.Router();

// use auth
router.use('/', auth.check({{roles}}))

// CRUD ROUTES

// GET ALL
router.get('/', async (req, res) => {
  const org = await {{model}}.find().exec();
  return res.json(org);
});

// GET ONE
router.get('/:id', async (req, res) => {
  const org = await {{model}}.findOne({ _id: req.params.id }).exec();
  return res.json(org);
});

// CREATE
router.post('/:model', async (req, res) => {
  const org = await new {{model}}(req.body).save();
  return res.json(org);
});

// UPDATE
router.put('/:model/:id', async (req, res) => {
  const org = await {{model}}.updateOne({ _id: req.params.id }, { $set: req.body }).exec();
  return res.json(org);
});

// DELETE
router.delete('/:model/:id', async (req, res) => {
  const org = await {{model}}.deleteOne({ _id: req.params.id }).exec();
  return res.json(org);
});

module.exports = router;
`,
};
