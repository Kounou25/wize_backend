const express = require('express');
const router = express.Router();

const {
  getAllCards,
  getCardById,
  createCard,
  deleteCard
} = require('../controllers/cards.controller');

const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getAllCards);
router.get('/:id', verifyToken, getCardById);
router.post('/', verifyToken, requireRole('admin', 'agent'), createCard);
router.delete('/:id', verifyToken, requireRole('admin'), deleteCard);

module.exports = router;