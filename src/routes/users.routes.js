const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, changePassword, deleteUser } = require('../controllers/users.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, requireRole('agent'), getAllUsers);
router.get('/:id', verifyToken, getUserById);
router.post('/', createUser);
router.put('/:id', verifyToken, requireRole('admin'), updateUser);
router.patch('/:id/password', verifyToken, changePassword);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUser);

module.exports = router;
