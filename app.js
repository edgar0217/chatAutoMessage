const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

const sequelize = require("./config/database");
const operadorRoutes = require("./routes/operadores");
const asociacionRoutes = require("./routes/asociaciones");
const trackerRoutes = require("./routes/trackers");

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = 4000;

// Configuración de EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware para parsear JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar rutas
app.use("/operadores", operadorRoutes);
app.use("/asociaciones", asociacionRoutes);
app.use("/trackers", trackerRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.render("home");
});

// Sincronizar tablas y luego iniciar servidor
sequelize
  .sync({ force: false }) // cambiar a true si quieres recrear tablas (pierdes datos)
  .then(() => {
    console.log("Tablas sincronizadas");
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error sincronizando tablas:", error);
  });
