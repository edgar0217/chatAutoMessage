// autoMessage.js

const { createFlow } = require("@bot-whatsapp/bot");
const { Op } = require("sequelize");
const Asociacion = require("../models/asociacion");
const Operador = require("../models/operador");
const axios = require("axios");
require("dotenv").config();

// --- Configuración de Navixy ---
const API_URL = process.env.NAVIXY_API_URL;
const NAVIXY_LOGIN = process.env.NAVIXY_LOGIN;
const NAVIXY_PASSWORD = process.env.NAVIXY_PASSWORD;

const axiosInstance = axios.create({ timeout: 17000 });

// --- Funciones auxiliares ---
async function obtenerDireccion(lat, lng) {
  try {
    const res = await axiosInstance.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    return res.data.address;
  } catch (err) {
    console.error("Error obteniendo dirección:", err.message);
    return null;
  }
}

async function getNavixyHash() {
  try {
    const { data } = await axiosInstance.post(`${API_URL}/user/auth`, {
      login: NAVIXY_LOGIN,
      password: NAVIXY_PASSWORD,
    });
    return data.hash;
  } catch (err) {
    console.error("Error autenticando en Navixy:", err.message);
    throw err;
  }
}

async function getAllTrackers(hash) {
  try {
    const { data } = await axiosInstance.get(
      `${API_URL}/tracker/list?hash=${hash}`
    );
    return data.list || [];
  } catch (err) {
    console.error("Error obteniendo lista de trackers:", err.message);
    return [];
  }
}

async function getTrackerState(hash, trackerId) {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/tracker/get_state`, {
      params: { hash, tracker_id: trackerId },
    });
    return data.state;
  } catch (err) {
    console.error(
      `Error obteniendo estado del tracker ${trackerId}:`,
      err.message
    );
    return null;
  }
}

// --- Estados internos para alertas automáticas ---
const estadosPrevios = {};
let alertaEnProceso = false;
let mensajeAgrupadoEnProceso = false;

// --- ENVÍO AUTOMÁTICO DE MENSAJES AGRUPADOS ---
async function enviarMensajesAgrupados(adapterProvider) {
  if (mensajeAgrupadoEnProceso) {
    console.log(
      "Enviar mensajes agrupados: tarea previa aún en proceso, salto esta ejecución."
    );
    return;
  }
  mensajeAgrupadoEnProceso = true;
  console.time("enviarMensajesAgrupados");

  try {
    const asociaciones = await Asociacion.findAll({
      attributes: ["trackerLabel", "operadorId"],
      include: [
        {
          model: Operador,
          attributes: ["telefono"],
        },
      ],
    });

    const operadoresTrackers = {};
    asociaciones.forEach(({ Operador, trackerLabel }) => {
      if (!Operador) return;
      const tel = Operador.telefono.trim();
      if (!operadoresTrackers[tel]) operadoresTrackers[tel] = [];
      operadoresTrackers[tel].push(trackerLabel);
    });

    const hash = await getNavixyHash();
    const trackers = await getAllTrackers(hash);

    for (const telefono in operadoresTrackers) {
      let numero = telefono.replace(/\D/g, "");
      if (!numero.startsWith("521")) numero = "521" + numero;
      const destinatario = numero + "@s.whatsapp.net";

      let mensajeCompleto = `📡 *Estado actual de tus trackers asociados:*\n\n`;

      for (const label of operadoresTrackers[telefono]) {
        const tracker = trackers.find(
          (t) => t.label.toLowerCase() === label.toLowerCase()
        );
        if (!tracker) continue;

        const state = await getTrackerState(hash, tracker.id);
        if (!state || !state.gps || !state.gps.location) continue;

        const { lat, lng } = state.gps.location;

        const connectionStatus =
          state.connection_status ||
          state.connection?.status ||
          state.connectionStatus ||
          state.status ||
          "desconocido";

        const movementStatus = state.movement_status || "desconocido";

        const direccion = await obtenerDireccion(lat, lng);
        let textoDireccion = "📌 Dirección no disponible.";
        if (direccion) {
          const {
            road,
            suburb,
            city,
            town,
            village,
            state,
            postcode,
            country,
          } = direccion;
          textoDireccion = `📌 Dirección aproximada:\n${[
            road,
            suburb,
            city || town || village,
            state,
            postcode,
            country,
          ]
            .filter(Boolean)
            .join(", ")}`;
        }

        mensajeCompleto +=
          `*${tracker.label}* (${tracker.id})\n` +
          `🗺️ https://www.google.com/maps?q=${lat},${lng}\n` +
          `${textoDireccion}\n` +
          `🔌 Estado de conexión: *${connectionStatus}*\n` +
          `🚗 Estado de movimiento: *${movementStatus}*\n\n`;
      }

      console.log(`Enviando mensaje agrupado a: ${destinatario}`);
      await adapterProvider.sendText(destinatario, mensajeCompleto);
    }
  } catch (error) {
    console.error("Error enviando mensajes agrupados:", error);
  }

  console.timeEnd("enviarMensajesAgrupados");
  mensajeAgrupadoEnProceso = false;
}

// --- ENVÍO AUTOMÁTICO DE ALERTAS DE CAMBIO DE ESTADO ---
async function enviarAlertasCambioEstado(adapterProvider) {
  if (alertaEnProceso) {
    console.log(
      "Enviar alertas: tarea previa aún en proceso, salto esta ejecución."
    );
    return;
  }
  alertaEnProceso = true;
  console.time("enviarAlertasCambioEstado");

  try {
    const asociaciones = await Asociacion.findAll({
      attributes: ["trackerLabel", "operadorId"],
      include: [
        {
          model: Operador,
          attributes: ["telefono"],
        },
      ],
    });

    const hash = await getNavixyHash();
    const trackers = await getAllTrackers(hash);

    for (const asoc of asociaciones) {
      const operador = asoc.Operador;
      if (!operador) continue;

      let numero = operador.telefono.trim().replace(/\D/g, "");
      if (!numero.startsWith("521")) numero = "521" + numero;
      const destinatario = numero + "@s.whatsapp.net";

      const tracker = trackers.find(
        (t) => t.label.toLowerCase() === asoc.trackerLabel.toLowerCase()
      );
      if (!tracker) continue;

      const state = await getTrackerState(hash, tracker.id);
      if (!state) continue;

      const connectionStatus =
        state.connection_status ||
        state.connection?.status ||
        state.connectionStatus ||
        state.status ||
        "desconocido";

      const movementStatus = state.movement_status || "desconocido";

      if (estadosPrevios[tracker.id] !== connectionStatus) {
        estadosPrevios[tracker.id] = connectionStatus;

        if (!state.gps || !state.gps.location) {
          console.warn(
            `Tracker ${tracker.label} no tiene ubicación GPS disponible.`
          );
          continue;
        }

        const { lat, lng } = state.gps.location;
        const direccion = await obtenerDireccion(lat, lng);
        let textoDireccion = "📌 Dirección no disponible.";
        if (direccion) {
          const {
            road,
            suburb,
            city,
            town,
            village,
            state,
            postcode,
            country,
          } = direccion;
          textoDireccion = `📌 Dirección aproximada:\n${[
            road,
            suburb,
            city || town || village,
            state,
            postcode,
            country,
          ]
            .filter(Boolean)
            .join(", ")}`;
        }

        const mensaje =
          `⚠️ *Alerta de cambio de estado de conexión*\n` +
          `Tracker: *${tracker.label}* (${tracker.id})\n` +
          `🔌 Estado de conexión: *${connectionStatus}*\n` +
          `🚗 Estado de movimiento: *${movementStatus}*\n` +
          `🗺️ https://www.google.com/maps?q=${lat},${lng}\n` +
          `${textoDireccion}`;

        console.log(`Enviando alerta a: ${destinatario}`);
        await adapterProvider.sendText(destinatario, mensaje);
      }
    }
  } catch (error) {
    console.error("Error enviando alertas de cambio de estado:", error);
  }

  console.timeEnd("enviarAlertasCambioEstado");
  alertaEnProceso = false;
}

// --- INICIAR TAREAS AUTOMÁTICAS ---
function iniciarEnvioInteligente(adapterProvider) {
  setInterval(() => {
    enviarAlertasCambioEstado(adapterProvider);
  }, 30 * 1000);

  setInterval(() => {
    enviarMensajesAgrupados(adapterProvider);
  }, 12 * 60 * 60 * 1000);
}

// --- FLUJOS (VACÍO, SIN MANUALES) ---
const flujos = createFlow([]); // ← Ya no hay comandos manuales activos

module.exports = {
  iniciarEnvioInteligente,
  flujos,
};
