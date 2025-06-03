require("dotenv").config();
const { createBot, createProvider } = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");

const { iniciarEnvioInteligente, flujos } = require("./utils/autoMessage");

const main = async () => {
  const adapterProvider = createProvider(BaileysProvider);

  // Crear el bot con los flujos que incluyen comandos
  createBot({
    flow: flujos,
    provider: adapterProvider,
    database: null, // Si usas DB real pon aquí el adapter correspondiente
  });

  QRPortalWeb();

  adapterProvider.on("ready", async () => {
    console.log("✅ Proveedor listo, iniciando sistema inteligente...");
    iniciarEnvioInteligente(adapterProvider);
  });
};

main();
