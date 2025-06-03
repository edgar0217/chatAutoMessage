const express = require("express");
const {
  showAsociaciones,
  createAsociacion,
  deleteAsociacion,
} = require("../controllers/asociacionController");

const router = express.Router();

router.get("/", showAsociaciones);
router.post("/crear", createAsociacion);
router.post("/eliminar/:id", deleteAsociacion); // nueva ruta

module.exports = router;
