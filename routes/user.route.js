const express = require('express');
const router = express.Router();

// import controller
const { requireSignin, adminMiddleware } = require('../controllers/auth.controller');
const { readController, updateController } = require('../controllers/user.controller');

router.get('/user/:id', requireSignin, readController);
router.put('/user/update', requireSignin, updateController);
router.put('/admin/update', requireSignin, adminMiddleware, updateController);

module.exports = router;