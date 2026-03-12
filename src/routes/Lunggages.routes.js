const express = require("express");
const router = express.Router();

const bagageController = require("../controllers/Lunggages.controller");


router.post("/", bagageController.createBagage);

router.get("/", bagageController.getAllBagages);

router.get("/:id", bagageController.getBagageById);

router.get("/voyage/:voyage_id", bagageController.getBagagesByVoyage);

router.put("/:id", bagageController.updateBagage);

router.delete("/:id", bagageController.deleteBagage);


module.exports = router;