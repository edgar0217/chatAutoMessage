const express = require("express");
const {
  showOperadores,
  createOperador,
  deleteOperador,
  editOperadorForm,
  updateOperador,
} = require("../controllers/operadorController");

const router = express.Router();

router.get("/", showOperadores);
router.post("/crear", createOperador);
router.post("/eliminar/:id", deleteOperador);
router.get("/editar/:id", editOperadorForm);
router.post("/editar/:id", updateOperador);

module.exports = router;
