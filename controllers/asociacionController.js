const Asociacion = require("../models/asociacion");
const Operador = require("../models/operador");
const { getTrackers } = require("./trackerController");

async function showAsociaciones(req, res) {
  try {
    const asociaciones = await Asociacion.findAll({
      include: [Operador],
    });

    const operadores = await Operador.findAll();
    const trackers = await getTrackers(); // Obtener lista de trackers cacheada

    res.render("asociaciones", { asociaciones, operadores, trackers });
  } catch (error) {
    console.error("Error al obtener asociaciones:", error);
    res.status(500).send("Error al cargar las asociaciones");
  }
}

async function createAsociacion(req, res) {
  const { operadorId, trackerLabel } = req.body;
  try {
    await Asociacion.create({ operadorId, trackerLabel });
    res.redirect("/asociaciones");
  } catch (error) {
    console.error("Error al crear asociación:", error);
    res.status(500).send("Error al crear la asociación");
  }
}

async function deleteAsociacion(req, res) {
  try {
    const id = req.params.id;
    await Asociacion.destroy({ where: { id } });
    res.redirect("/asociaciones");
  } catch (error) {
    console.error("Error al eliminar asociación:", error);
    res.status(500).send("Error al eliminar la asociación");
  }
}

module.exports = {
  showAsociaciones,
  createAsociacion,
  deleteAsociacion, // agregar aquí
};
