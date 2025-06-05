const Asociacion = require("../models/asociacion");
const Operador = require("../models/operador");
const { getTrackers } = require("./trackerController");

async function showAsociaciones(req, res) {
  try {
    const asociaciones = await Asociacion.findAll({
      include: [Operador],
    });

    const operadores = await Operador.findAll();
    const trackers = await getTrackers();

    res.render("asociaciones", { asociaciones, operadores, trackers });
  } catch (error) {
    req.flash("error", "Error al cargar las asociaciones");
    res.redirect("/asociaciones");
  }
}

async function createAsociacion(req, res) {
  const { operadorId, trackerLabel } = req.body;
  try {
    await Asociacion.create({ operadorId, trackerLabel });
    req.flash("success", "¡Asociación creada exitosamente!");
    res.redirect("/asociaciones");
  } catch (error) {
    req.flash("error", "Error al crear la asociación");
    res.redirect("/asociaciones");
  }
}

async function deleteAsociacion(req, res) {
  try {
    const id = req.params.id;
    await Asociacion.destroy({ where: { id } });
    req.flash("success", "¡Asociación eliminada correctamente!");
    res.redirect("/asociaciones");
  } catch (error) {
    req.flash("error", "Error al eliminar la asociación");
    res.redirect("/asociaciones");
  }
}

module.exports = {
  showAsociaciones,
  createAsociacion,
  deleteAsociacion,
};
