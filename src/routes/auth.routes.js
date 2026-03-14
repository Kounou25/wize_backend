const express = require('express');
const router = express.Router();
const { login, refresh, logout, logoutAll, getMe } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', verifyToken, logoutAll);
router.get('/me', verifyToken, getMe);

module.exports = router;
