const Operador = require("../models/operador.js");

// Mostrar la lista de operadores y (opcionalmente) el formulario de edición
async function showOperadores(req, res) {
  try {
    const operadores = await Operador.findAll();
    res.render("operadores", {
      operadores,
      operadorEditar: res.locals.operadorEditar || undefined,
    });
  } catch (error) {
    req.flash("error", "Error al cargar los operadores");
    res.redirect("/operadores");
  }
}

// Crear un operador
async function createOperador(req, res) {
  const { nombre, telefono } = req.body;
  try {
    await Operador.create({ nombre, telefono });
    req.flash("success", "Operador creado exitosamente");
    res.redirect("/operadores");
  } catch (error) {
    req.flash("error", "Error al crear el operador");
    res.redirect("/operadores");
  }
}

// Mostrar formulario de edición usando la misma vista
async function editOperadorForm(req, res, next) {
  try {
    const operadorEditar = await Operador.findByPk(req.params.id);
    if (!operadorEditar) return res.redirect("/operadores");
    res.locals.operadorEditar = operadorEditar;
    return showOperadores(req, res, next);
  } catch (error) {
    req.flash("error", "Error al mostrar formulario de edición");
    res.redirect("/operadores");
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
    req.flash("success", "Operador editado exitosamente");
    res.redirect("/operadores");
  } catch (error) {
    req.flash("error", "Error al editar el operador");
    res.redirect("/operadores");
  }
}

// Eliminar un operador
async function deleteOperador(req, res) {
  try {
    await Operador.destroy({ where: { id: req.params.id } });
    req.flash("success", "Operador eliminado exitosamente");
    res.redirect("/operadores");
  } catch (error) {
    req.flash("error", "Error al eliminar el operador, puede que esté en uso");
    res.redirect("/operadores");
  }
}

module.exports = {
  showOperadores,
  createOperador,
  deleteOperador,
  editOperadorForm,
  updateOperador,
};
