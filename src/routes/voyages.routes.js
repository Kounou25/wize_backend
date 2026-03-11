const { Router } = require('express');
const {
  getAllVoyages,
  getVoyageById,
  createVoyage,
  getVoyageByTel,
  updateVoyage,
  deleteVoyage,
} = require('../controllers/voyages.controller');

const router = Router();

router.get('/', getAllVoyages);
router.get('/:id', getVoyageById);
router.get('/phone/:tel', getVoyageByTel);
router.post('/', createVoyage);
router.put('/:id', updateVoyage);
router.delete('/:id', deleteVoyage);

module.exports = router;
