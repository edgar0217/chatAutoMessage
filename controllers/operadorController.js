const Operador = require("../models/operador");

// Función para mostrar la lista de operadores
async function showOperadores(req, res) {
  try {
    const operadores = await Operador.findAll();
    res.render("operadores", { operadores });
  } catch (error) {
    console.error("Error al obtener operadores:", error);
    res.status(500).send("Error al cargar los operadores");
  }
}

// Función para crear un operador
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

// Función para eliminar un operador
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
};
