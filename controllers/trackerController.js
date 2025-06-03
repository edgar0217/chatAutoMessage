const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const NAVIXY_AUTH_URL = `${process.env.NAVIXY_API_URL}/user/auth`;
const NAVIXY_TRACKER_LIST_URL = `${process.env.NAVIXY_API_URL}/tracker/list`;

const NAVIXY_USERNAME = process.env.NAVIXY_LOGIN;
const NAVIXY_PASSWORD = process.env.NAVIXY_PASSWORD;

let cachedTrackers = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 20 * 60 * 1000; // 5 minutos

async function getHash() {
  const response = await axios.post(
    NAVIXY_AUTH_URL,
    { login: NAVIXY_USERNAME, password: NAVIXY_PASSWORD },
    { headers: { "Content-Type": "application/json" } }
  );
  if (!response?.data || !response.data.hash) {
    throw new Error("No se encontró el hash en la respuesta");
  }
  return response.data.hash;
}

// Función exportada para obtener trackers (cacheada)
async function getTrackers() {
  const now = Date.now();
  if (cachedTrackers && now - cacheTimestamp < CACHE_DURATION_MS) {
    return cachedTrackers;
  }

  const hash = await getHash();
  const response = await axios.get(NAVIXY_TRACKER_LIST_URL, {
    params: { hash },
  });

  if (response.data.success !== true || !Array.isArray(response.data.list)) {
    throw new Error("Error obteniendo lista de trackers");
  }

  cachedTrackers = response.data.list;
  cacheTimestamp = now;

  return cachedTrackers;
}

// Controlador para mostrar trackers con paginación, búsqueda, orden
async function showTrackers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search?.toLowerCase() || "";
    const sort = req.query.sort || "original";

    const allTrackers = await getTrackers();

    let filtered = search
      ? allTrackers.filter((t) => t.label.toLowerCase().includes(search))
      : allTrackers;

    if (sort === "az")
      filtered = filtered.sort((a, b) => a.label.localeCompare(b.label));
    else if (sort === "za")
      filtered = filtered.sort((a, b) => b.label.localeCompare(a.label));

    const pageSize = 200;
    const totalPages = Math.ceil(filtered.length / pageSize);
    const trackers = filtered.slice((page - 1) * pageSize, page * pageSize);

    res.render("trackers", {
      trackers,
      currentPage: page,
      totalPages,
      search,
      sort,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar los trackers");
  }
}

module.exports = {
  getTrackers,
  showTrackers,
};
