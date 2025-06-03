const express = require("express");
const {
  showOperadores,
  createOperador,
  deleteOperador,
} = require("../controllers/operadorController");

const router = express.Router();

// Rutas para los operadores
router.get("/", showOperadores);
router.post("/crear", createOperador);
router.post("/eliminar/:id", deleteOperador);

module.exports = router;
