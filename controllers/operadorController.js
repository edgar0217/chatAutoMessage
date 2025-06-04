const Operador = require("../models/operador.js");

// Mostrar la lista de operadores y (opcionalmente) el formulario de edición
async function showOperadores(req, res) {
  try {
    const operadores = await Operador.findAll();
    // operadorEditar solo existe si viene desde la edición, si no es undefined
    res.render("operadores", {
      operadores,
      operadorEditar: res.locals.operadorEditar || undefined,
    });
  } catch (error) {
    console.error("Error al obtener operadores:", error);
    res.status(500).send("Error al cargar los operadores");
  }
}

// Crear un operador
async function createOperador(req, res) {
  const { nombre, telefono } = req.body;
  try {
    await Operador.create({ nombre, telefono });
    res.redirect("/operadores");
  } catch (error) {
    console.error("Error al crear operador:", error);
    res.status(500).send("Error al crear el operador");
  }
}

// Mostrar formulario de edición usando la misma vista
async function editOperadorForm(req, res, next) {
  try {
    const operadorEditar = await Operador.findByPk(req.params.id);
    if (!operadorEditar) return res.redirect("/operadores");
    // Guardar operadorEditar en res.locals y llamar a showOperadores
    res.locals.operadorEditar = operadorEditar;
    return showOperadores(req, res, next);
  } catch (error) {
    console.error("Error al mostrar formulario de edición:", error);
    res.status(500).send("Error al mostrar formulario");
  }
}

// Procesar edición
async function updateOperador(req, res) {
  const { nombre, telefono } = req.body;
  try {
    await Operador.update(
      { nombre, telefono },
      { where: { id: req.params.id } }
    );
    res.redirect("/operadores");
  } catch (error) {
    console.error("Error al editar operador:", error);
    res.status(500).send("Error al editar el operador");
  }
}

// Eliminar un operador
async function deleteOperador(req, res) {
  try {
    await Operador.destroy({ where: { id: req.params.id } });
    res.redirect("/operadores");
  } catch (error) {
    console.error("Error al eliminar operador:", error);
    res.status(500).send("Error al eliminar el operador");
  }
}

module.exports = {
  showOperadores,
  createOperador,
  deleteOperador,
  editOperadorForm,
  updateOperador,
};
