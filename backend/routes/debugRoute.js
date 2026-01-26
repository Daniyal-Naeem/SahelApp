const express = require('express');
const router = express.Router();
const { debugUser } = require('../controllers/debugController');

router.get('/debug-user', debugUser);

module.exports = router;

