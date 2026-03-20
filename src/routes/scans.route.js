const express = require('express');
const router = express.Router();

const {
  getAllScans,
  getScanById,
  createScan,
  deleteScan
} = require('../controllers/scans.controller');

const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getAllScans);
router.get('/:id', verifyToken, getScanById);
router.post(
  '/',
  verifyToken,
  requireRole('admin', 'agent', 'embarquement', 'bagagiste'),
  createScan
);
router.delete('/:id', verifyToken, requireRole('admin'), deleteScan);
module.exports = router;