const express = require('express');
const router = express.Router();
const { getAllAgences, getAgenceById, createAgence, updateAgence, deleteAgence } = require('../controllers/agences.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getAllAgences);
router.get('/:id', verifyToken, getAgenceById);
router.post('/', verifyToken, requireRole('admin'), createAgence);
router.put('/:id', verifyToken, requireRole('admin'), updateAgence);
router.delete('/:id', verifyToken, requireRole('admin'), deleteAgence);

module.exports = router;
