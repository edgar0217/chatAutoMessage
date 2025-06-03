const express = require("express");
const { showTrackers } = require("../controllers/trackerController");

const router = express.Router();

// Ruta para mostrar trackers
router.get("/", showTrackers);

module.exports = router;
